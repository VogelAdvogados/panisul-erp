
'use server';

/**
 * @fileOverview Transfers funds between two internal accounts (e.g., Cash to Bank).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, writeBatch } from 'firebase/firestore';
import type { FinancialMovement, SourceAccount } from '@/lib/types';
import { format } from 'date-fns';

const TransferFundsInputSchema = z.object({
  fromAccount: z.custom<SourceAccount>(),
  toAccount: z.custom<SourceAccount>(),
  amount: z.number().positive('O valor da transferência deve ser positivo.'),
  date: z.string(),
  notes: z.string().optional(),
}).refine(data => data.fromAccount !== data.toAccount, {
  message: "A conta de origem e destino não podem ser as mesmas.",
  path: ["toAccount"],
});


const TransferFundsOutputSchema = z.object({
  message: z.string(),
});

export async function transferFunds(
  input: z.infer<typeof TransferFundsInputSchema>
): Promise<z.infer<typeof TransferFundsOutputSchema>> {
  return transferFundsFlow(input);
}


const transferFundsFlow = ai.defineFlow(
  {
    name: 'transferFundsFlow',
    inputSchema: TransferFundsInputSchema,
    outputSchema: TransferFundsOutputSchema,
  },
  async ({ fromAccount, toAccount, amount, date, notes }) => {
    
    const batch = writeBatch(db);
    const movementsRef = collection(db, 'financialMovements');
    const today = format(new Date(date), 'yyyy-MM-dd');
    const description = notes || `Transferência de ${fromAccount} para ${toAccount}`;

    // Create debit movement (saída)
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
    const debitRef = doc(movementsRef);
    batch.set(debitRef, debitMovement);
    
    // Create credit movement (entrada)
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
    const creditRef = doc(movementsRef);
    batch.set(creditRef, creditMovement);

    await batch.commit();

    return {
      message: `Transferência de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de ${fromAccount} para ${toAccount} registrada com sucesso.`,
    };
  }
);
