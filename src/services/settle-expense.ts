'use server';

import { z } from 'zod';
import { doc, getDoc, updateDoc } from '@/lib/netly';
import { format } from 'date-fns';

const SettleExpenseInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
});
export type SettleExpenseInput = z.infer<typeof SettleExpenseInputSchema>;

export async function settleExpense(
  input: SettleExpenseInput,
): Promise<{ message: string }> {
  const { movementId } = input;

  const movementRef = doc('financialMovements', movementId);
  const movement = (await getDoc(movementRef)) as { status: string } | null;
  if (!movement) {
    throw new Error(`Movimentação financeira ${movementId} não encontrada.`);
  }
  if (movement.status === 'paid') {
    throw new Error('Esta conta já foi liquidada anteriormente.');
  }

  await updateDoc(movementRef, {
    status: 'paid',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
  });

  return { message: 'Pagamento de despesa registrado com sucesso!' };
}
