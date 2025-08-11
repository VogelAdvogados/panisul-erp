
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, Package, Loader2, PlusCircle } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function IngredientList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const { toast } = useToast();

  const fetchIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const ingredientsCollection = collection(db, 'ingredients');
      const ingredientSnapshot = await getDocs(ingredientsCollection);
      const ingredientList = ingredientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
      setIngredients(ingredientList);
    } catch (error) {
      toast({
          title: "Erro ao buscar insumos",
          description: "Não foi possível carregar os insumos do banco de dados.",
          variant: "destructive"
      });
      console.error("Error fetching ingredients: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleOpenForm = (ingredient: Ingredient | null) => {
    setEditingIngredient(ingredient);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingIngredient(null);
    setIsFormOpen(false);
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "ingredients", id));
        await fetchIngredients(); // Refetch data
        toast({
            title: "Insumo Excluído!",
            description: "O insumo foi removido com sucesso.",
        });
    } catch (error) {
        toast({
            title: "Erro ao excluir",
            description: "Não foi possível excluir o insumo.",
            variant: "destructive"
        });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const ingredientData = {
      name: formData.get('name') as string,
      stock: parseFloat(formData.get('stock') as string),
      unitOfMeasure: formData.get('unitOfMeasure') as Ingredient['unitOfMeasure'],
      cost: parseFloat(formData.get('cost') as string),
    };

    try {
        if (editingIngredient) {
          const ingredientDoc = doc(db, "ingredients", editingIngredient.id);
          await updateDoc(ingredientDoc, ingredientData);
          toast({ title: "Insumo Atualizado!", description: "Os dados do insumo foram atualizados." });
        } else {
          await addDoc(collection(db, "ingredients"), ingredientData);
          toast({ title: "Insumo Criado!", description: "Um novo insumo foi adicionado ao sistema." });
        }
        await fetchIngredients(); // Refetch data
    } catch(error) {
         toast({ title: "Erro!", description: "Ocorreu um erro ao salvar o insumo.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
        handleCloseForm();
    }
  };


  const formatUnit = (quantity: number, unit: string) => {
    if (unit === 'g' && quantity >= 1000) {
        return `${(quantity/1000).toFixed(2)} kg`
    }
     if (unit === 'ml' && quantity >= 1000) {
        return `${(quantity/1000).toFixed(2)} l`
    }
    return `${quantity} ${unit}`;
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
                    <CardTitle>Insumos</CardTitle>
                    <CardDescription>Gerencie suas matérias-primas e outros insumos.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Insumo
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Custo por Unidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{ingredient.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={ingredient.stock < 1000 ? "destructive" : "default"}>
                            {formatUnit(ingredient.stock, ingredient.unitOfMeasure)}
                            </Badge>
                        </TableCell>
                        <TableCell>{ingredient.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {ingredient.unitOfMeasure}</TableCell>
                        <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(ingredient)}>
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
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o insumo.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(ingredient.id)}>
                                    Sim, Excluir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                    {ingredients.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                Nenhum insumo encontrado.
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
                <DialogTitle>{editingIngredient ? 'Editar Insumo' : 'Adicionar Novo Insumo'}</DialogTitle>
                <DialogDescription>
                    {editingIngredient ? 'Altere os dados abaixo para atualizar o insumo.' : 'Preencha os dados abaixo para cadastrar um novo insumo.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" name="name" defaultValue={editingIngredient?.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">Estoque</Label>
                        <Input id="stock" name="stock" type="number" step="0.01" defaultValue={editingIngredient?.stock} className="col-span-3" required/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unitOfMeasure" className="text-right">Unidade</Label>
                        <Select name="unitOfMeasure" defaultValue={editingIngredient?.unitOfMeasure || 'g'}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="g">Grama (g)</SelectItem>
                                <SelectItem value="kg">Quilograma (kg)</SelectItem>
                                <SelectItem value="ml">Mililitro (ml)</SelectItem>
                                <SelectItem value="l">Litro (l)</SelectItem>
                                <SelectItem value="un">Unidade (un)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cost" className="text-right">Custo/Un.</Label>
                        <Input id="cost" name="cost" type="number" step="0.001" defaultValue={editingIngredient?.cost} className="col-span-3" required />
                    </div>
                </div>
                    <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Salvando...' : (editingIngredient ? 'Salvar Alterações' : 'Cadastrar Insumo')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
