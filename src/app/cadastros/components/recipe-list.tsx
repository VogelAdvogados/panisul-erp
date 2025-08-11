
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Edit, Trash2, Atom, Loader2 } from 'lucide-react';
import type { Recipe, Product, Ingredient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [ingredientsMap, setIngredientsMap] = useState<Map<string, Ingredient>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsSnapshot, ingredientsSnapshot, recipesSnapshot] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'ingredients')),
          getDocs(collection(db, 'recipes')),
        ]);

        const products = new Map(productsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() } as Product]));
        const ingredients = new Map(ingredientsSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() } as Ingredient]));
        const recipeList = recipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));

        setProductsMap(products);
        setIngredientsMap(ingredients);
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
    };

    fetchData();
  }, [toast]);

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
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }


  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Input placeholder="Buscar por produto..." className="max-w-sm" />
        </div>
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
    </div>
  );
}

    