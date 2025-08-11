
'use server';

/**
 * @fileOverview Registers a new production run, updating product stock
 * and decrementing ingredient stock based on the recipe.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, getDoc } from 'firebase/firestore';
import type { Recipe, Ingredient } from '@/lib/types';

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
    
    await runTransaction(db, async (transaction) => {
        // 1. Get the recipe for the product
        const recipeRef = doc(db, 'recipes', productId); // Assuming recipe ID is same as product ID
        const recipeDoc = await transaction.get(recipeRef);
        
        if (!recipeDoc.exists()) {
            throw new Error(`Ficha técnica para o produto ${productId} não encontrada.`);
        }
        const recipe = recipeDoc.data() as Recipe;

        // 2. Decrement ingredient stock
        for (const item of recipe.items) {
            const ingredientRef = doc(db, 'ingredients', item.ingredientId);
            const ingredientDoc = await transaction.get(ingredientRef);
            
            if (!ingredientDoc.exists()) {
                throw new Error(`Insumo ${item.ingredientId} não encontrado.`);
            }

            const currentStock = ingredientDoc.data()?.stock || 0;
            const requiredStock = item.quantity * quantity;

            if (currentStock < requiredStock) {
                throw new Error(`Estoque insuficiente para ${ingredientDoc.data()?.name}. Necessário: ${requiredStock}, Disponível: ${currentStock}`);
            }

            transaction.update(ingredientRef, { stock: currentStock - requiredStock });
        }

        // 3. Increment product stock
        const productRef = doc(db, 'products', productId);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
            throw new Error(`Produto ${productId} não encontrado.`);
        }
        const currentProductStock = productDoc.data()?.stock || 0;
        const currentProduced = productDoc.data()?.produced || 0;

        transaction.update(productRef, { 
            stock: currentProductStock + quantity,
            produced: currentProduced + quantity,
        });

    });

    return {
        message: `${quantity} unidade(s) do produto ${productId} registradas. Estoque de produtos e insumos atualizado.`,
    };
  }
);
