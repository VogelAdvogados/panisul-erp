
'use client';

import { useState } from 'react';
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
import { MoreHorizontal, Edit, Trash2, Atom } from 'lucide-react';
import { 
    recipes as initialRecipes,
    products as initialProducts,
    ingredients as initialIngredients
} from '@/lib/data';
import type { Recipe, Product, Ingredient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

// Helper to create maps for quick lookups
const productsMap = new Map(initialProducts.map(p => [p.id, p]));
const ingredientsMap = new Map(initialIngredients.map(i => [i.id, i]));

export function RecipeList() {
  const [recipes] = useState<Recipe[]>(initialRecipes);

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
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
