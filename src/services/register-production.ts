'use server';

import { z } from 'zod';
import { db, doc, getDoc, updateDoc, increment } from '@/lib/netly';
import type { Recipe, Ingredient, Product } from '@/lib/types';

const RegisterProductionInputSchema = z.object({
  productId: z.string().describe('The ID of the product being produced.'),
  quantity: z.number().int().positive().describe('The quantity of the product being produced.'),
});
export type RegisterProductionInput = z.infer<typeof RegisterProductionInputSchema>;

export async function registerProduction(
  input: RegisterProductionInput,
): Promise<{ message: string }> {
  const { productId, quantity } = input;

  const product = (await getDoc(doc(db, 'products', productId))) as Product | null;
  if (!product) {
    throw new Error(`Produto com ID ${productId} não encontrado.`);
  }

  const recipe = (await getDoc(doc(db, 'recipes', productId))) as Recipe | null;
  if (!recipe) {
    throw new Error(`Ficha técnica para o produto ${product.name} não encontrada.`);
  }

  for (const item of recipe.items) {
    const ingredient = (await getDoc(doc(db, 'ingredients', item.ingredientId))) as Ingredient | null;
    if (!ingredient) {
      throw new Error(`Insumo com ID ${item.ingredientId} da receita não foi encontrado.`);
    }
    const currentStock = ingredient.stock || 0;
    const requiredStock = item.quantity * quantity;
    if (currentStock < requiredStock) {
      throw new Error(
        `Estoque insuficiente para o insumo "${ingredient.name}". Necessário: ${requiredStock}${ingredient.unitOfMeasure}, Disponível: ${currentStock}${ingredient.unitOfMeasure}`,
      );
    }
    await updateDoc(doc(db, 'ingredients', item.ingredientId), { stock: increment(-requiredStock) });
  }

  await updateDoc(doc(db, 'products', productId), {
    stock: increment(quantity),
    produced: increment(quantity),
  });

  return {
    message: `${quantity} unidade(s) de ${product.name} registradas com sucesso. Estoques de produtos e insumos foram atualizados.`,
  };
}
