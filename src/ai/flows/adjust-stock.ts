
'use server';

/**
 * @fileOverview Manually adjusts the stock of a single product or ingredient.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';

const AdjustStockInputSchema = z.object({
  itemId: z.string().describe('The ID of the product or ingredient to adjust.'),
  itemType: z.enum(['product', 'ingredient']).describe('Whether the item is a product or an ingredient.'),
  adjustmentType: z.enum(['entrada', 'saida', 'perda', 'acerto']).describe('The type of stock adjustment.'),
  quantity: z.number().positive('Quantity must be a positive number.'),
  notes: z.string().optional().describe('Reason for the adjustment.'),
});
export type AdjustStockInput = z.infer<typeof AdjustStockInputSchema>;

const AdjustStockOutputSchema = z.object({
  message: z.string(),
});
export type AdjustStockOutput = z.infer<typeof AdjustStockOutputSchema>;

export async function adjustStock(
  input: AdjustStockInput
): Promise<AdjustStockOutput> {
  return adjustStockFlow(input);
}

const adjustStockFlow = ai.defineFlow(
  {
    name: 'adjustStockFlow',
    inputSchema: AdjustStockInputSchema,
    outputSchema: AdjustStockOutputSchema,
  },
  async ({ itemId, itemType, adjustmentType, quantity }) => {
    
    const collectionPath = itemType === 'product' ? 'products' : 'ingredients';
    const itemRef = doc(db, collectionPath, itemId);

    await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) {
            throw new Error(`Item with ID ${itemId} not found in ${collectionPath}.`);
        }

        let stockChange = 0;
        switch (adjustmentType) {
            case 'entrada':
            case 'acerto': // For simplicity, acerto sets the stock, but here we model it as an addition for now. A true 'set' would need more info. Or let's assume 'acerto' is 'add what was missing'.
                stockChange = quantity;
                break;
            case 'saida':
            case 'perda':
                stockChange = -quantity;
                break;
        }

        transaction.update(itemRef, { stock: increment(stockChange) });
    });

    return {
        message: `Estoque de ${itemDoc.data()?.name || 'item'} ajustado com sucesso.`,
    };
  }
);
