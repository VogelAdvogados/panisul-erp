// @ts-nocheck
'use server';

import { z } from 'zod';
import { db, collection, doc, runTransaction, increment } from '@/lib/netly';
import type { Exchange } from '@/lib/types';
import { format } from 'date-fns';

const RegisterExchangeInputSchema = z.object({
  customerId: z.string().optional().describe('The ID of the customer performing the exchange.'),
  returnedProductId: z.string().describe('The ID of the product being returned by the customer.'),
  newProductId: z.string().describe('The ID of the new product being given to the customer.'),
  reason: z.string().describe('The reason for the exchange.'),
  returnedProductStatus: z.enum(['restock', 'discard']).describe('The condition of the returned product.'),
});
export type RegisterExchangeInput = z.infer<typeof RegisterExchangeInputSchema>;

export async function registerExchange(
  input: RegisterExchangeInput
): Promise<{ message: string; exchangeId: string }> {
  const { customerId, returnedProductId, newProductId, reason, returnedProductStatus } = input;

  const exchangeId = await runTransaction(db, async (transaction) => {
    const returnedProductRef = doc(db, 'products', returnedProductId);
    const newProductRef = doc(db, 'products', newProductId);

    const newProductDoc = await transaction.get(newProductRef);
    if (!newProductDoc.exists() || newProductDoc.data().stock < 1) {
      throw new Error(`Estoque insuficiente para o produto de troca: ${newProductDoc.data()?.name || 'ID ' + newProductId}`);
    }
    transaction.update(newProductRef, { stock: increment(-1) });

    if (returnedProductStatus === 'restock') {
      transaction.update(returnedProductRef, { stock: increment(1) });
    }

    if (customerId && customerId !== 'none') {
      const customerRef = doc(db, 'customers', customerId);
      transaction.update(customerRef, { exchanges: increment(1) });
    }

    const exchangeData: Omit<Exchange, 'id'> = {
      date: format(new Date(), 'yyyy-MM-dd'),
      customerId: customerId === 'none' ? undefined : customerId,
      returnedProductId,
      newProductId,
      reason,
      returnedProductStatus,
    };
    const exchangeRef = doc(collection(db, 'exchanges'));
    transaction.set(exchangeRef, exchangeData);
    return exchangeRef.id;
  });

  return { message: 'Troca registrada com sucesso. Estoque ajustado.', exchangeId };
}
