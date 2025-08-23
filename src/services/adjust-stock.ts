'use server';

import { z } from 'zod';
import { db, doc, getDoc, updateDoc, increment } from '@/lib/netly';
import type { Product, Ingredient } from '@/lib/types';

const AdjustStockInputSchema = z.object({
  itemId: z.string().describe('The ID of the product or ingredient to adjust.'),
  itemType: z.enum(['product', 'ingredient']).describe('Whether the item is a product or an ingredient.'),
  adjustmentType: z.enum(['entrada', 'saida', 'perda', 'acerto']).describe('The type of stock adjustment.'),
  quantity: z.number().positive('Quantity must be a positive number.'),
  notes: z.string().optional().describe('Reason for the adjustment.'),
});
export type AdjustStockInput = z.infer<typeof AdjustStockInputSchema>;

export async function adjustStock(
  input: AdjustStockInput,
): Promise<{ message: string }> {
  const { itemId, itemType, adjustmentType, quantity } = input;
  const collectionPath = itemType === 'product' ? 'products' : 'ingredients';
  const itemRef = doc(db, collectionPath, itemId);

  const itemSnap = await getDoc<Product | Ingredient>(itemRef);
  const item = itemSnap.data();
  if (!itemSnap.exists()) {
    throw new Error(`Item with ID ${itemId} not found in ${collectionPath}.`);
  }

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

  await updateDoc(itemRef, { stock: increment(stockChange) });

  return {
    message: `Estoque de ${item.name || 'item'} ajustado com sucesso.`,
  };
}
