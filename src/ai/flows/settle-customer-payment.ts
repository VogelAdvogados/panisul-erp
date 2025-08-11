
'use server';

/**
 * @fileOverview Settles a customer's pending payment.
 * It marks a financial movement as 'paid' and updates the customer's pending amount.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, runTransaction, increment } from 'firebase/firestore';
import { format } from 'date-fns';

export const SettleCustomerPaymentInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
  customerId: z.string().describe('The ID of the customer.'),
  amount: z.number().describe('The amount being paid.'),
});
export type SettleCustomerPaymentInput = z.infer<typeof SettleCustomerPaymentInputSchema>;

export const SettleCustomerPaymentOutputSchema = z.object({
  message: z.string(),
});
export type SettleCustomerPaymentOutput = z.infer<typeof SettleCustomerPaymentOutputSchema>;

export async function settleCustomerPayment(
  input: SettleCustomerPaymentInput
): Promise<SettleCustomerPaymentOutput> {
  return settleCustomerPaymentFlow(input);
}

const settleCustomerPaymentFlow = ai.defineFlow(
  {
    name: 'settleCustomerPaymentFlow',
    inputSchema: SettleCustomerPaymentInputSchema,
    outputSchema: SettleCustomerPaymentOutputSchema,
  },
  async ({ movementId, customerId, amount }) => {
    
    await runTransaction(db, async (transaction) => {
      const movementRef = doc(db, 'financialMovements', movementId);
      const customerRef = doc(db, 'customers', customerId);
      
      const movementDoc = await transaction.get(movementRef);
      if (!movementDoc.exists()) {
        throw new Error(`Movimentação financeira ${movementId} não encontrada.`);
      }

      // 1. Update Financial Movement status and payment date
      transaction.update(movementRef, {
        status: 'paid',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
      });

      // 2. Decrement customer's pending amount
      transaction.update(customerRef, {
        pendingAmount: increment(-amount),
      });
    });

    return {
      message: `Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso!`,
    };
  }
);
