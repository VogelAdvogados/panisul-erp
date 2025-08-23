'use server';

import { z } from 'zod';
import { db, doc, getDoc, updateDoc, addDoc, increment } from '@/lib/netly';
import type { Exchange, Product } from '@/lib/types';
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
  input: RegisterExchangeInput,
): Promise<{ message: string; exchangeId: string }> {
  const { customerId, returnedProductId, newProductId, reason, returnedProductStatus } = input;

  const newProductRef = doc(db, 'products', newProductId);
  const newProductSnap = await getDoc(newProductRef);
  if (!newProductSnap.exists()) {
    throw new Error(`Produto de troca com ID ${newProductId} não encontrado.`);
  }
  const newProduct = newProductSnap.data() as Product;
  if (newProduct.stock < 1) {
    throw new Error(`Estoque insuficiente para o produto de troca: ${newProduct.name}`);
  }
  await updateDoc(newProductRef, { stock: increment(-1) });

  if (returnedProductStatus === 'restock') {
    const returnedProductRef = doc(db, 'products', returnedProductId);
    await updateDoc(returnedProductRef, { stock: increment(1) });
  }

  if (customerId && customerId !== 'none') {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, { exchanges: increment(1) });
  }

  const exchangeData: Omit<Exchange, 'id'> = {
    date: format(new Date(), 'yyyy-MM-dd'),
    customerId: customerId === 'none' ? undefined : customerId,
    returnedProductId,
    newProductId,
    reason,
    returnedProductStatus,
  };
  const exchangeRef = await addDoc('exchanges', exchangeData);
  return { message: 'Troca registrada com sucesso. Estoque ajustado.', exchangeId: exchangeRef.id };
}
