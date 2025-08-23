
'use server';

/**
 * @fileOverview Registers a new miscellaneous expense.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import type { FinancialMovement, ExpenseCategory } from '@/lib/types';
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

const RegisterExpenseOutputSchema = z.object({
  movementId: z.string(),
  message: z.string(),
});

export async function registerExpense(
  input: z.infer<typeof RegisterExpenseInputSchema>
): Promise<z.infer<typeof RegisterExpenseOutputSchema>> {
  return registerExpenseFlow(input);
}

const registerExpenseFlow = ai.defineFlow(
  {
    name: 'registerExpenseFlow',
    inputSchema: RegisterExpenseInputSchema,
    outputSchema: RegisterExpenseOutputSchema,
  },
  async (input) => {
    
    const financialMovement: Omit<FinancialMovement, 'id'> = {
      description: input.description,
      dueDate: input.dueDate,
      amount: -Math.abs(input.amount), // Ensure expense is always negative
      status: input.paymentStatus,
      paymentDate: input.paymentStatus === 'paid' ? format(new Date(input.dueDate), 'yyyy-MM-dd') : undefined,
      category: input.category as ExpenseCategory,
      sourceAccount: input.sourceAccount,
      type: 'expense',
      employeeId: input.employeeId === 'none' ? undefined : input.employeeId,
    };

    const movementRef = await adminDb
      .collection('financialMovements')
      .add(financialMovement);

    return {
      movementId: movementRef.id,
      message: `Despesa "${input.description}" registrada com sucesso.`,
    };
  }
);
