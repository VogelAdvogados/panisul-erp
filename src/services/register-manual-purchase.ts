'use server';

import { z } from 'zod';
import { db, addDoc, doc, getDoc, updateDoc, increment } from '@/lib/netly';
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
export type RegisterManualPurchaseInput = z.infer<typeof RegisterManualPurchaseInputSchema>;

export async function registerManualPurchase(
  input: RegisterManualPurchaseInput,
): Promise<{ purchaseId: string; message: string }> {
  const supplier = (await getDoc(doc(db, 'suppliers', input.supplierId))) as Supplier | null;
  if (!supplier) {
    throw new Error('Fornecedor não encontrado.');
  }

  const purchaseData: Omit<Purchase, 'id'> = {
    supplierId: input.supplierId,
    invoiceNumber: input.invoiceNumber || `MANUAL-${Date.now()}`,
    date: input.date,
    totalAmount: input.totalAmount,
    paymentMethod: input.paymentMethod,
    items: [],
  };

  for (const item of input.items) {
    const ingredient = (await getDoc(doc(db, 'ingredients', item.ingredientId))) as Ingredient | null;
    if (!ingredient) {
      throw new Error(`Insumo com ID ${item.ingredientId} não encontrado.`);
    }

    const oldStock = ingredient.stock;
    const oldCost = ingredient.cost;
    const newQuantity = item.quantity;
    const newPrice = item.unitPrice;
    const newTotalStock = oldStock + newQuantity;
    const newAverageCost =
      newTotalStock > 0
        ? (oldStock * oldCost + newQuantity * newPrice) / newTotalStock
        : newPrice;

    await updateDoc(doc(db, 'ingredients', item.ingredientId), {
      stock: increment(newQuantity),
      cost: newAverageCost,
    });

    purchaseData.items.push({
      name: ingredient.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  }

  const purchaseRef = await addDoc('purchases', purchaseData);

  const installmentValue = input.totalAmount / input.installments;
  const isPaidOnPurchase = ['pix', 'dinheiro', 'cartao_debito'].includes(input.paymentMethod);

  for (let i = 0; i < input.installments; i++) {
    const dueDate = addMonths(new Date(input.firstDueDate), i);
    const financialMovement: Omit<FinancialMovement, 'id'> = {
      description: `Compra ${purchaseData.invoiceNumber} - ${supplier.name} (Parc. ${i + 1}/${input.installments})`,
      referenceId: purchaseRef.id,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      amount: -installmentValue,
      status: isPaidOnPurchase ? 'paid' : 'pending',
      paymentDate: isPaidOnPurchase ? format(new Date(input.date), 'yyyy-MM-dd') : undefined,
      category: 'insumos',
      sourceAccount: input.sourceAccount,
      type: 'expense',
    };
    await addDoc('financialMovements', financialMovement);
  }

  return {
    purchaseId: purchaseRef.id,
    message: `Compra de ${supplier.name} no valor de ${input.totalAmount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })} registrada com sucesso!`,
  };
}
