// @ts-nocheck

'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, collection, getDocs, doc, writeBatch, setDoc, deleteDoc } from '@/lib/netly';
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
import { MoreHorizontal, Edit, Trash2, Atom, Loader2, PlusCircle, MinusCircle } from 'lucide-react';
import type { Recipe, Product, Ingredient, RecipeItem } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [ingredientsMap, setIngredientsMap] = useState<Map<string, Ingredient>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeItems, setRecipeItems] = useState<Partial<RecipeItem>[]>([{ ingredientId: '', quantity: 0 }]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsSnapshot, ingredientsSnapshot, recipesSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'ingredients')),
        getDocs(collection(db, 'recipes')),
      ]);

      const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const ingredientList = ingredientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
      const productsMap = new Map(productList.map(p => [p.id, p]));
      const ingredientsMap = new Map(ingredientList.map(i => [i.id, i]));
      const recipeList = recipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));

      setProducts(productList);
      setIngredients(ingredientList);
      setProductsMap(productsMap);
      setIngredientsMap(ingredientsMap);
      setRecipes(recipeList);

    } catch (error) {
      toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar os dados para as fichas técnicas.",
          variant: "destructive"
      });
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenForm = (recipe: Recipe | null) => {
    setEditingRecipe(recipe);
    if (recipe) {
        setRecipeItems(recipe.items);
    } else {
        setRecipeItems([{ ingredientId: '', quantity: 0 }]);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingRecipe(null);
    setRecipeItems([{ ingredientId: '', quantity: 0 }]);
    setIsFormOpen(false);
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "recipes", id));
        await fetchData(); // Refetch
        toast({ title: "Ficha Técnica Excluída!", description: "A receita foi removida com sucesso." });
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível excluir a ficha técnica.", variant: "destructive" });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;

    if (!productId || recipeItems.some(item => !item.ingredientId || !item.quantity || item.quantity <= 0)) {
        toast({ title: "Dados inválidos", description: "Preencha todos os campos da receita.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    const recipeData: Omit<Recipe, 'id'> = {
        productId,
        items: recipeItems as RecipeItem[],
    }

    try {
        const docId = editingRecipe ? editingRecipe.id : productId;
        const recipeRef = doc(db, 'recipes', docId);
        
        // Using setDoc with the product ID as the recipe ID
        await setDoc(recipeRef, recipeData);

        if (editingRecipe) {
            toast({ title: "Ficha Técnica Atualizada!", description: "A receita foi atualizada com sucesso."});
        } else {
            toast({ title: "Ficha Técnica Criada!", description: "A nova receita foi salva com sucesso."});
        }
        await fetchData(); // Refetch all data
    } catch (err) {
        toast({ title: "Erro ao salvar", description: "Não foi possível salvar a ficha técnica.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        handleCloseForm();
    }
  };

  const handleItemChange = (index: number, field: keyof RecipeItem, value: string | number) => {
    const newItems = [...recipeItems];
    const item = { ...newItems[index] };
    (item[field] as any) = field === 'quantity' ? Number(value) : value;
    newItems[index] = item;
    setRecipeItems(newItems);
  }

  const addItem = () => setRecipeItems([...recipeItems, { ingredientId: '', quantity: 0 }]);
  const removeItem = (index: number) => setRecipeItems(recipeItems.filter((_, i) => i !== index));

  const calculateCost = (recipe: Recipe) => {
    return recipe.items.reduce((total, item) => {
        const ingredient = ingredientsMap.get(item.ingredientId);
        if (!ingredient) return total;
        return total + (ingredient.cost * item.quantity);
    }, 0);
  }

  const getIngredientList = (recipe: Recipe) => {
    return recipe.items.map(item => {
        const ingredient = ingredientsMap.get(item.ingredientId);
        return ingredient ? `${item.quantity}${ingredient.unitOfMeasure} ${ingredient.name}` : 'Insumo não encontrado';
    }).join(', ');
  }
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <>
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                 <div>
                    <CardTitle>Fichas Técnicas</CardTitle>
                    <CardDescription>Gerencie as receitas dos seus produtos.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Ficha Técnica
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Produto Final</TableHead>
                    <TableHead>Insumos</TableHead>
                    <TableHead>Custo de Produção</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                            <Atom className="h-4 w-4 text-muted-foreground" />
                            <span>{productsMap.get(recipe.productId)?.name || 'Produto não encontrado'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-sm truncate" title={getIngredientList(recipe)}>
                            {getIngredientList(recipe)}
                        </TableCell>
                        <TableCell>
                        <Badge variant="secondary">
                            {calculateCost(recipe).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                                <DropdownMenuItem onClick={() => handleOpenForm(recipe)}>
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
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a ficha técnica.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(recipe.id)}>
                                    Sim, Excluir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                    {recipes.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            Nenhuma ficha técnica encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl" onInteractOutside={(e) => { if(isSubmitting) e.preventDefault()}} onEscapeKeyDown={(e) => { if(isSubmitting) e.preventDefault()}}>
            <DialogHeader>
                <DialogTitle>{editingRecipe ? 'Editar Ficha Técnica' : 'Criar Nova Ficha Técnica'}</DialogTitle>
                <DialogDescription>
                    Defina os insumos e quantidades para produzir um item. O ID da receita será o mesmo do produto final.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="productId">Produto Final</Label>
                        <Select name="productId" required defaultValue={editingRecipe?.productId} disabled={!!editingRecipe}>
                            <SelectTrigger id="productId">
                                <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Insumos da Receita</Label>
                        <div className='space-y-2'>
                        {recipeItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Select value={item.ingredientId} onValueChange={(value) => handleItemChange(index, 'ingredientId', value)}>
                                    <SelectTrigger><SelectValue placeholder="Selecione o insumo"/></SelectTrigger>
                                    <SelectContent>
                                        {ingredients.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.unitOfMeasure})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input 
                                    type="number" 
                                    placeholder="Qtd." 
                                    className="w-28" 
                                    value={item.quantity || ''}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive">
                                    <MinusCircle className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addItem}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Insumo
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Salvando...' : (editingRecipe ? 'Salvar Alterações' : 'Criar Ficha')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
