'use server';

import { z } from 'zod';
import { db, doc, getDoc, updateDoc, increment } from '@/lib/netly';
import { format } from 'date-fns';
import type { Customer } from '@/lib/types';

const SettleCustomerPaymentInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
  customerId: z.string().describe('The ID of the customer.'),
  amount: z.number().describe('The amount being paid.'),
});
export type SettleCustomerPaymentInput = z.infer<typeof SettleCustomerPaymentInputSchema>;

export async function settleCustomerPayment(
  input: SettleCustomerPaymentInput,
): Promise<{ message: string }> {
  const { movementId, customerId, amount } = input;

  const movementRef = doc(db, 'financialMovements', movementId);
  const movementSnap = await getDoc<{ status: string }>(movementRef);
  const movement = movementSnap.data();
  if (!movementSnap.exists()) {
    throw new Error(`Movimentação financeira ${movementId} não encontrada.`);
  }
  if (movement.status === 'paid') {
    throw new Error('Esta conta já foi liquidada anteriormente.');
  }

  await updateDoc(movementRef, {
    status: 'paid',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const customerRef = doc(db, 'customers', customerId);
  const customerSnap = await getDoc<Customer>(customerRef);
  const customer = customerSnap.data();
  if (!customerSnap.exists()) {
    throw new Error(`Cliente ${customerId} não encontrado.`);
  }

  await updateDoc(customerRef, {
    pendingAmount: increment(-Math.abs(amount)),
  });

  return {
    message: `Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso!`,
  };
}
