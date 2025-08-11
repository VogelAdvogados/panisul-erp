
'use server';

/**
 * @fileOverview Registers a new manual purchase, creating the purchase record,
 * financial movements for installments, and updating ingredient stock.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, runTransaction, getDoc, increment } from 'firebase/firestore';
import type { Purchase, FinancialMovement, Supplier, Ingredient, SourceAccount } from '@/lib/types';
import { format, addMonths } from 'date-fns';

const PurchaseItemSchema = z.object({
  ingredientId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

const RegisterManualPurchaseInputSchema = z.object({
  supplierId: z.string(),
  invoiceNumber: z.string().optional(),
  date: z.string(),
  sourceAccount: z.custom<SourceAccount>(),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  installments: z.number().int().min(1),
  firstDueDate: z.string(),
  items: z.array(PurchaseItemSchema),
  totalAmount: z.number(),
});

const RegisterManualPurchaseOutputSchema = z.object({
  purchaseId: z.string(),
  message: z.string(),
});

export async function registerManualPurchase(
  input: z.infer<typeof RegisterManualPurchaseInputSchema>
): Promise<z.infer<typeof RegisterManualPurchaseOutputSchema>> {
  return registerManualPurchaseFlow(input);
}

const registerManualPurchaseFlow = ai.defineFlow(
  {
    name: 'registerManualPurchaseFlow',
    inputSchema: RegisterManualPurchaseInputSchema,
    outputSchema: RegisterManualPurchaseOutputSchema,
  },
  async (input) => {

    const supplierDoc = await getDoc(doc(db, 'suppliers', input.supplierId));
    if (!supplierDoc.exists()) {
        throw new Error('Fornecedor não encontrado.');
    }
    const supplier = supplierDoc.data() as Supplier;
    
    const purchaseId = await runTransaction(db, async (transaction) => {
      // 1. Create the Purchase document
      const purchaseData: Omit<Purchase, 'id' | 'financialMovements'> = {
        supplierId: input.supplierId,
        invoiceNumber: input.invoiceNumber || `MANUAL-${Date.now()}`,
        date: input.date,
        totalAmount: input.totalAmount,
        paymentMethod: input.paymentMethod,
        items: [], // We'll populate this after fetching ingredient names
      };

      const purchaseRef = doc(collection(db, 'purchases'));
      
      // 2. Update stock for each ingredient and get item names for the purchase doc
      for (const item of input.items) {
        const ingredientRef = doc(db, 'ingredients', item.ingredientId);
        const ingredientDoc = await transaction.get(ingredientRef);
        if (!ingredientDoc.exists()) {
          throw new Error(`Insumo com ID ${item.ingredientId} não encontrado.`);
        }
        const ingredientName = ingredientDoc.data().name || 'Insumo desconhecido';
        transaction.update(ingredientRef, {
          stock: increment(item.quantity)
        });
        purchaseData.items.push({
            name: ingredientName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        });
      }
      
      transaction.set(purchaseRef, purchaseData);

      // 3. Create Financial Movements for each installment
      const installmentValue = input.totalAmount / input.installments;
      const isPaidOnPurchase = ['pix', 'dinheiro', 'cartao_debito'].includes(input.paymentMethod);

      for (let i = 0; i < input.installments; i++) {
        const dueDate = addMonths(new Date(input.firstDueDate), i);
        const financialMovement: Omit<FinancialMovement, 'id'> = {
          description: `Compra ${purchaseData.invoiceNumber} - ${supplier.name} (Parc. ${i + 1}/${input.installments})`,
          referenceId: purchaseRef.id,
          dueDate: format(dueDate, 'yyyy-MM-dd'),
          amount: -installmentValue, // Expenses are negative
          status: isPaidOnPurchase ? 'paid' : 'pending',
          paymentDate: isPaidOnPurchase ? format(new Date(input.date), 'yyyy-MM-dd') : undefined,
          category: 'insumos',
          sourceAccount: input.sourceAccount,
          type: 'expense',
        };
        const movementRef = doc(collection(db, 'financialMovements'));
        transaction.set(movementRef, financialMovement);
      }

      return purchaseRef.id;
    });

    return {
      purchaseId,
      message: `Compra de ${supplier.name} no valor de ${input.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada com sucesso!`,
    };
  }
);
