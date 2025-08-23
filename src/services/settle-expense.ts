// @ts-nocheck
'use server';

import { z } from 'zod';
import { db, doc, runTransaction } from '@/lib/netly';
import { format } from 'date-fns';

const SettleExpenseInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
});
export type SettleExpenseInput = z.infer<typeof SettleExpenseInputSchema>;

export async function settleExpense(
  input: SettleExpenseInput
): Promise<{ message: string }> {
  const { movementId } = input;

  await runTransaction(db, async (transaction) => {
    const movementRef = doc(db, 'financialMovements', movementId);
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
  });

  return { message: 'Pagamento de despesa registrado com sucesso!' };
}
