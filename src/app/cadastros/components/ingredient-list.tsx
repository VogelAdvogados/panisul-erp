
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
import { MoreHorizontal, Edit, Trash2, Package, Loader2 } from 'lucide-react';
import type { Ingredient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function IngredientList() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchIngredients = async () => {
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
    };

    fetchIngredients();
  }, [toast]);


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
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Input placeholder="Buscar por nome..." className="max-w-sm" />
        </div>
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
    </div>
  );
}

    