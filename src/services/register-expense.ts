'use server';

import { z } from 'zod';
import { addDoc } from '@/lib/netly';
import type { FinancialMovement, ExpenseCategory, SourceAccount } from '@/lib/types';
import { format } from 'date-fns';

const RegisterExpenseInputSchema = z.object({
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  sourceAccount: z.enum(['cash', 'bank']),
  dueDate: z.string(),
  paymentStatus: z.enum(['pending', 'paid']),
  employeeId: z.string().optional(),
});
export type RegisterExpenseInput = z.infer<typeof RegisterExpenseInputSchema>;

export async function registerExpense(
  input: RegisterExpenseInput
): Promise<{ movementId: string; message: string }> {
  const financialMovement: Omit<FinancialMovement, 'id'> = {
    description: input.description,
    dueDate: input.dueDate,
    amount: -Math.abs(input.amount),
    status: input.paymentStatus,
    paymentDate:
      input.paymentStatus === 'paid'
        ? format(new Date(input.dueDate), 'yyyy-MM-dd')
        : undefined,
    category: input.category as ExpenseCategory,
    sourceAccount: input.sourceAccount as SourceAccount,
    type: 'expense',
    employeeId: input.employeeId === 'none' ? undefined : input.employeeId,
  };

  const movementRef = await addDoc('financialMovements', financialMovement);
  return {
    movementId: movementRef.id,
    message: `Despesa "${input.description}" registrada com sucesso.`,
  };
}
