
'use server';

/**
 * @fileOverview Settles a customer's pending payment.
 * It marks a financial movement as 'paid' and updates the customer's pending amount.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, runTransaction, increment, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import type { SourceAccount, PaymentMethod } from '@/lib/types';

const SettleCustomerPaymentInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
  customerId: z.string().describe('The ID of the customer.'),
  amount: z.number().describe('The amount being paid.'),
  sourceAccount: z.custom<SourceAccount>(),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
});

const SettleCustomerPaymentOutputSchema = z.object({
  message: z.string(),
});

export async function settleCustomerPayment(
  input: z.infer<typeof SettleCustomerPaymentInputSchema>
): Promise<z.infer<typeof SettleCustomerPaymentOutputSchema>> {
  return settleCustomerPaymentFlow(input);
}

const settleCustomerPaymentFlow = ai.defineFlow(
  {
    name: 'settleCustomerPaymentFlow',
    inputSchema: SettleCustomerPaymentInputSchema,
    outputSchema: SettleCustomerPaymentOutputSchema,
  },
  async ({ movementId, customerId, amount, sourceAccount, paymentMethod }) => {
    
    await runTransaction(db, async (transaction) => {
      const movementRef = doc(db, 'financialMovements', movementId);
      const customerRef = doc(db, 'customers', customerId);
      
      const movementDoc = await transaction.get(movementRef);
      if (!movementDoc.exists()) {
        throw new Error(`Movimentação financeira ${movementId} não encontrada.`);
      }
       if (movementDoc.data()?.status === 'paid') {
        throw new Error(`Esta conta já foi liquidada anteriormente.`);
      }

      // 1. Update Financial Movement status and payment date
      transaction.update(movementRef, {
        status: 'paid',
        paymentDate: format(new Date(), 'yyyy-MM-dd'),
        sourceAccount,
        paymentMethod,
      });

      // 2. Decrement customer's pending amount
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
);
