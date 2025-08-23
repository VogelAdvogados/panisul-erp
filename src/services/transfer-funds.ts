'use server';

import { z } from 'zod';
import { addDoc } from '@/lib/netly';
import type { FinancialMovement, SourceAccount } from '@/lib/types';
import { format } from 'date-fns';

const TransferFundsInputSchema = z.object({
  fromAccount: z.custom<SourceAccount>(),
  toAccount: z.custom<SourceAccount>(),
  amount: z.number().positive('O valor da transferência deve ser positivo.'),
  date: z.string(),
  notes: z.string().optional(),
}).refine(data => data.fromAccount !== data.toAccount, {
  message: 'A conta de origem e destino não podem ser as mesmas.',
  path: ['toAccount'],
});
export type TransferFundsInput = z.infer<typeof TransferFundsInputSchema>;

export async function transferFunds(
  input: TransferFundsInput,
): Promise<{ message: string }> {
  const { fromAccount, toAccount, amount, date, notes } = input;
  const today = format(new Date(date), 'yyyy-MM-dd');
  const description = notes || `Transferência de ${fromAccount} para ${toAccount}`;

  const debitMovement: Omit<FinancialMovement, 'id'> = {
    description: `Saída: ${description}`,
    dueDate: today,
    amount: -Math.abs(amount),
    status: 'paid',
    paymentDate: today,
    type: 'expense',
    category: 'outros',
    sourceAccount: fromAccount,
  };
  await addDoc('financialMovements', debitMovement);

  const creditMovement: Omit<FinancialMovement, 'id'> = {
    description: `Entrada: ${description}`,
    dueDate: today,
    amount: Math.abs(amount),
    status: 'paid',
    paymentDate: today,
    type: 'revenue',
    category: 'outros',
    sourceAccount: toAccount,
  };
  await addDoc('financialMovements', creditMovement);

  return {
    message: `Transferência de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de ${fromAccount} para ${toAccount} registrada com sucesso.`,
  };
}
