
'use server';

/**
 * @fileOverview Manually adjusts the stock of a single product or ingredient.
 */

import { z } from 'zod';
import { db, doc, runTransaction, increment } from '@/lib/netly';

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
  const { itemId, itemType, adjustmentType, quantity } = input;

  const collectionPath = itemType === 'product' ? 'products' : 'ingredients';
  const itemRef = doc(db, collectionPath, itemId);

  let itemName = 'item';
  await runTransaction(db, async (transaction) => {
    const itemDoc = await transaction.get(itemRef);
    if (!itemDoc.exists()) {
      throw new Error(`Item with ID ${itemId} not found in ${collectionPath}.`);
    }

    itemName = (itemDoc.data() as { name?: string }).name || 'item';

    let stockChange = 0;
    switch (adjustmentType) {
      case 'entrada':
      case 'acerto':
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
    message: `Estoque de ${itemName} ajustado com sucesso.`,
  };
}
