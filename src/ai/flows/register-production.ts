
'use server';

/**
 * @fileOverview Registers a new production run, updating product stock
 * and decrementing ingredient stock based on the recipe.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, collection, doc, runTransaction, getDoc, increment } from '@/lib/netly';
import type { Recipe, Ingredient, Product } from '@/lib/types';

const RegisterProductionInputSchema = z.object({
  productId: z.string().describe('The ID of the product being produced.'),
  quantity: z.number().int().positive().describe('The quantity of the product being produced.'),
});
export type RegisterProductionInput = z.infer<typeof RegisterProductionInputSchema>;

const RegisterProductionOutputSchema = z.object({
  message: z.string(),
});
export type RegisterProductionOutput = z.infer<typeof RegisterProductionOutputSchema>;


export async function registerProduction(
  input: RegisterProductionInput
): Promise<RegisterProductionOutput> {
  return registerProductionFlow(input);
}


const registerProductionFlow = ai.defineFlow(
  {
    name: 'registerProductionFlow',
    inputSchema: RegisterProductionInputSchema,
    outputSchema: RegisterProductionOutputSchema,
  },
  async ({ productId, quantity }) => {
    
    const productName = await runTransaction(db, async (transaction) => {
        // 1. Get the product and its recipe
        const productRef = doc(db, 'products', productId);
        const recipeRef = doc(db, 'recipes', productId); // Assuming recipe ID is same as product ID
        
        const [productDoc, recipeDoc] = await Promise.all([
            transaction.get(productRef),
            transaction.get(recipeRef)
        ]);
        
        if (!productDoc.exists()) {
            throw new Error(`Produto com ID ${productId} não encontrado.`);
        }
        if (!recipeDoc.exists()) {
            throw new Error(`Ficha técnica para o produto ${productDoc.data().name} não encontrada.`);
        }
        
        const product = productDoc.data() as Product;
        const recipe = recipeDoc.data() as Recipe;

        // 2. Check and decrement ingredient stock
        for (const item of recipe.items) {
            const ingredientRef = doc(db, 'ingredients', item.ingredientId);
            const ingredientDoc = await transaction.get(ingredientRef);
            
            if (!ingredientDoc.exists()) {
                throw new Error(`Insumo com ID ${item.ingredientId} da receita não foi encontrado.`);
            }

            const ingredient = ingredientDoc.data() as Ingredient;
            const currentStock = ingredient.stock || 0;
            const requiredStock = item.quantity * quantity;

            if (currentStock < requiredStock) {
                throw new Error(`Estoque insuficiente para o insumo "${ingredient.name}". Necessário: ${requiredStock}${ingredient.unitOfMeasure}, Disponível: ${currentStock}${ingredient.unitOfMeasure}`);
            }

            transaction.update(ingredientRef, { stock: increment(-requiredStock) });
        }

        // 3. Increment product stock and produced count
        transaction.update(productRef, { 
            stock: increment(quantity),
            produced: increment(quantity),
        });

        return product.name;
    });

    return {
        message: `${quantity} unidade(s) de ${productName} registradas com sucesso. Estoques de produtos e insumos foram atualizados.`,
    };
  }
);
