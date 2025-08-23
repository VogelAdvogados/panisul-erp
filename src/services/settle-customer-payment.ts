// @ts-nocheck
'use server';

import { z } from 'zod';
import { db, doc, runTransaction, increment, getDoc } from '@/lib/netly';
import { format } from 'date-fns';

const SettleCustomerPaymentInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
  customerId: z.string().describe('The ID of the customer.'),
  amount: z.number().describe('The amount being paid.'),
});
export type SettleCustomerPaymentInput = z.infer<typeof SettleCustomerPaymentInputSchema>;

export async function settleCustomerPayment(
  input: SettleCustomerPaymentInput
): Promise<{ message: string }> {
  const { movementId, customerId, amount } = input;

  await runTransaction(db, async (transaction) => {
    const movementRef = doc(db, 'financialMovements', movementId);
    const customerRef = doc(db, 'customers', customerId);

    const movementDoc = await transaction.get(movementRef);
    if (!movementDoc.exists()) {
      throw new Error(`Movimentação financeira ${movementId} não encontrada.`);
    }
    if (movementDoc.data()?.status === 'paid') {
      throw new Error('Esta conta já foi liquidada anteriormente.');
    }

    transaction.update(movementRef, {
      status: 'paid',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const customerDoc = await transaction.get(customerRef);
    if (!customerDoc.exists()) {
      throw new Error(`Cliente ${customerId} não encontrado.`);
    }
    transaction.update(customerRef, {
      pendingAmount: increment(-Math.abs(amount)),
    });
  });

  return {
    message: `Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso!`,
  };
}
