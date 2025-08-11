
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch, getCountFromServer, query, collectionGroup } from 'firebase/firestore';
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
import { products as initialProducts, ingredients as initialIngredients, suppliers as initialSuppliers, recipes as initialRecipes, customers as initialCustomers, initialFinancialMovements } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
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
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenForm = (product: Product | null) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(p => p.id !== id));
        toast({
            title: "Produto Excluído!",
            description: "O produto foi removido com sucesso.",
            variant: "destructive"
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
    const formData = new FormData(e.currentTarget);
    const newProductData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
    };

    try {
        if (editingProduct) {
          const productDoc = doc(db, "products", editingProduct.id);
          await updateDoc(productDoc, newProductData);
          setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...newProductData } : p));
          toast({ title: "Produto Atualizado!", description: "Os dados do produto foram atualizados." });
        } else {
          const newProduct: Omit<Product, 'id'> = {
            ...newProductData,
            produced: 0,
            sold: 0,
            imageUrl: 'https://placehold.co/600x400.png',
            'data-ai-hint': newProductData.name.toLowerCase(),
          };
          const docRef = await addDoc(collection(db, "products"), newProduct);
          setProducts([{ id: docRef.id, ...newProduct }, ...products]);
          toast({ title: "Produto Criado!", description: "Um novo produto foi adicionado ao sistema." });
        }
    } catch(error) {
         toast({ title: "Erro!", description: "Ocorreu um erro ao salvar o produto.", variant: 'destructive' });
    } finally {
        setIsFormOpen(false);
        setEditingProduct(null);
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
                description: 'Os produtos iniciais já existem no Firestore.',
                variant: 'destructive',
            });
            return;
        }

        const batch = writeBatch(db);
        
        // Seed Products
        initialProducts.forEach(product => {
            const docRef = doc(db, 'products', product.id);
            batch.set(docRef, product);
        });

        // Seed Ingredients
        initialIngredients.forEach(ingredient => {
            const docRef = doc(db, 'ingredients', ingredient.id);
            batch.set(docRef, ingredient);
        });

        // Seed Suppliers
        initialSuppliers.forEach(supplier => {
            const docRef = doc(db, 'suppliers', supplier.id);
            batch.set(docRef, supplier);
        });

        // Seed Recipes
        initialRecipes.forEach(recipe => {
            const docRef = doc(db, 'recipes', recipe.id);
            batch.set(docRef, recipe);
        });

        // Seed Customers
        initialCustomers.forEach(customer => {
            const docRef = doc(db, 'customers', customer.id);
            batch.set(docRef, customer);
        });

        // Seed Financial Movements
        initialFinancialMovements.forEach(movement => {
            const docRef = doc(db, 'financialMovements', movement.id);
            batch.set(docRef, movement);
        });


        await batch.commit();
        toast({
            title: 'Sucesso!',
            description: 'Todo o sistema foi populado com dados iniciais.'
        });
        fetchProducts(); // Refresh list
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
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>Gerencie seus produtos acabados.</CardDescription>
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
                    {products.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Nenhum produto encontrado. Clique em "Popular Dados Iniciais" para começar.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
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
                            <DialogClose asChild>
                                <Button type="button" variant="ghost">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">{editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CardContent>
    </Card>
  );
}

    