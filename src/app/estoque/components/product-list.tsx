

'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, getCountFromServer } from 'firebase/firestore';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Loader2, Database } from 'lucide-react';
import type { Product } from '@/lib/types';
import { initialProducts, initialIngredients, initialSuppliers, initialRecipes, initialCustomers, initialFinancialMovements } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
    } catch (error) {
        toast({
            title: "Erro ao buscar produtos",
            description: "Não foi possível carregar os produtos do banco de dados.",
            variant: "destructive"
        });
        console.error("Error fetching products: ", error);
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenForm = (product: Product | null) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };


  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "products", id));
        await fetchProducts(); // Refetch data
        toast({
            title: "Produto Excluído!",
            description: "O produto foi removido com sucesso.",
        });
    } catch (error) {
        toast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o produto.",
            variant: "destructive"
        });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const newProductData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      produced: editingProduct ? editingProduct.produced : 0,
      sold: editingProduct ? editingProduct.sold : 0,
    };

    try {
        if (editingProduct) {
          const productDoc = doc(db, "products", editingProduct.id);
          await updateDoc(productDoc, newProductData);
          toast({ title: "Produto Atualizado!", description: "Os dados do produto foram atualizados." });
        } else {
          await addDoc(collection(db, "products"), newProductData);
          toast({ title: "Produto Criado!", description: "Um novo produto foi adicionado ao sistema." });
        }
        await fetchProducts(); // Refetch data
    } catch(error) {
         toast({ title: "Erro!", description: "Ocorreu um erro ao salvar o produto.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
        handleCloseForm();
    }
  };

  const seedDatabase = async () => {
      setIsSeeding(true);
      try {
        const productsCollection = collection(db, 'products');
        const snapshot = await getCountFromServer(productsCollection);
        
        if (snapshot.data().count > 0) {
            toast({
                title: 'Banco de dados já populado',
                description: 'Os dados iniciais já existem no Firestore.',
                variant: 'destructive',
            });
            setIsSeeding(false);
            return;
        }

        const batch = writeBatch(db);
        
        initialProducts.forEach(product => {
            const docRef = doc(db, 'products', product.id);
            batch.set(docRef, product);
        });

        initialIngredients.forEach(ingredient => {
            const docRef = doc(db, 'ingredients', ingredient.id);
            batch.set(docRef, ingredient);
        });

        initialSuppliers.forEach(supplier => {
            const docRef = doc(db, 'suppliers', supplier.id);
            batch.set(docRef, supplier);
        });

        initialRecipes.forEach(recipe => {
            const docRef = doc(db, 'recipes', recipe.id);
            batch.set(docRef, recipe);
        });

        initialCustomers.forEach(customer => {
            const docRef = doc(db, 'customers', customer.id);
            batch.set(docRef, customer);
        });
        
        initialFinancialMovements.forEach(movement => {
            const docRef = doc(collection(db, 'financialMovements'));
            batch.set(docRef, movement);
        });


        await batch.commit();
        toast({
            title: 'Sucesso!',
            description: 'Todo o sistema foi populado com dados iniciais.'
        });
        await fetchProducts(); // Fetch data again after seeding

      } catch (error) {
        console.error("Error seeding database: ", error);
        toast({
            title: 'Erro ao popular banco de dados',
            description: 'Não foi possível adicionar os dados iniciais.',
            variant: 'destructive'
        })
      } finally {
          setIsSeeding(false);
      }
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <>
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Produtos Acabados</CardTitle>
                    <CardDescription>Gerencie os produtos prontos para venda.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={seedDatabase} disabled={isSeeding}>
                        {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4" />}
                        {isSeeding ? 'Populando...' : 'Popular Dados Iniciais'}
                    </Button>
                    <Button onClick={() => handleOpenForm(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Produto
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço de Venda</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell>
                            <Badge variant={product.stock < 10 ? "destructive" : "default"}>
                                {product.stock} un.
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(product)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Excluir
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto
                                    e removerá seus dados de nossos servidores.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>
                                    Sim, Excluir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                    {products.length === 0 && !isLoading && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Nenhum produto encontrado. Clique em "Popular Dados Iniciais" para começar.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </CardContent>
    </Card>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if(isSubmitting) e.preventDefault()}} onEscapeKeyDown={(e) => { if(isSubmitting) e.preventDefault()}}>
            <DialogHeader>
                <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
                <DialogDescription>
                    {editingProduct ? 'Altere os dados abaixo para atualizar o produto.' : 'Preencha os dados abaixo para cadastrar um novo produto.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" name="name" defaultValue={editingProduct?.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Preço</Label>
                        <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">Estoque</Label>
                        <Input id="stock" name="stock" type="number" defaultValue={editingProduct?.stock} className="col-span-3" required />
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Salvando...' : (editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
