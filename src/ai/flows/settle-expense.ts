
'use server';

/**
 * @fileOverview Settles a pending expense.
 * It marks a financial movement as 'paid'.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, doc, runTransaction } from '@/lib/netly';
import { format } from 'date-fns';

const SettleExpenseInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
});

const SettleExpenseOutputSchema = z.object({
  message: z.string(),
});

export async function settleExpense(
  input: z.infer<typeof SettleExpenseInputSchema>
): Promise<z.infer<typeof SettleExpenseOutputSchema>> {
  return settleExpenseFlow(input);
}

const settleExpenseFlow = ai.defineFlow(
  {
    name: 'settleExpenseFlow',
    inputSchema: SettleExpenseInputSchema,
    outputSchema: SettleExpenseOutputSchema,
  },
  async ({ movementId }) => {
    
    await runTransaction(db, async (transaction) => {
      const movementRef = doc(db, 'financialMovements', movementId);
      
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
      });

    });

    return {
      message: `Pagamento de despesa registrado com sucesso!`,
    };
  }
);
