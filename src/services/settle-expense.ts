'use server';

import { z } from 'zod';
import { db, doc, getDoc, updateDoc } from '@/lib/netly';
import { format } from 'date-fns';

const SettleExpenseInputSchema = z.object({
  movementId: z.string().describe('The ID of the financial movement to be settled.'),
});
export type SettleExpenseInput = z.infer<typeof SettleExpenseInputSchema>;

export async function settleExpense(
  input: SettleExpenseInput,
): Promise<{ message: string }> {
  const { movementId } = input;

  const movementRef = doc(db, 'financialMovements', movementId);
  const movementSnap = await getDoc(movementRef);
  if (!movementSnap.exists()) {
    throw new Error(`Movimentação financeira ${movementId} não encontrada.`);
  }
  const movement = movementSnap.data() as { status: string };
  if (movement.status === 'paid') {
    throw new Error('Esta conta já foi liquidada anteriormente.');
  }

  await updateDoc(movementRef, {
    status: 'paid',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
  });

  return { message: 'Pagamento de despesa registrado com sucesso!' };
}
