'use server';

import { z } from 'zod';
import { db, doc, getDoc, updateDoc, addDoc, increment } from '@/lib/netly';
import type { Product, FinancialMovement, SourceAccount, Sale, SaleItem, SaleChannel } from '@/lib/types';
import { format } from 'date-fns';

const SaleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  productName: z.string(),
});

const RegisterSaleInputSchema = z.object({
  items: z.array(SaleItemSchema),
  totalAmount: z.number(),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  sourceAccount: z.custom<SourceAccount>(),
  customerId: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['concluida', 'pendente']),
  channel: z.custom<SaleChannel>(),
  salespersonId: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});
export type RegisterSaleInput = z.infer<typeof RegisterSaleInputSchema>;

export async function registerSale(
  input: RegisterSaleInput,
): Promise<{ message: string; saleId: string }> {
  const {
    items,
    totalAmount,
    paymentMethod,
    sourceAccount,
    customerId,
    dueDate,
    channel,
    salespersonId,
    location,
    notes,
    status,
  } = input;
  const isSaleOnCredit = !!dueDate;
  const isConcluded = status === 'concluida';
  const productNames: string[] = [];

  if (isConcluded) {
    for (const item of items) {
      const productSnap = await getDoc(
        doc(db, 'products', item.productId),
      );
      if (!productSnap.exists()) {
        throw new Error(`Produto ${item.productName} não encontrado.`);
      }
      const product = productSnap.data() as Product;
      const currentStock = product.stock || 0;
      if (currentStock < item.quantity) {
        throw new Error(
          `Estoque insuficiente para ${product.name}. Disponível: ${currentStock}, Solicitado: ${item.quantity}`,
        );
      }
      await updateDoc(doc(db, 'products', item.productId), {
        stock: increment(-item.quantity),
        sold: increment(item.quantity),
      });
      productNames.push(item.productName);
    }
  }

  const today = new Date();
  const saleData: Omit<Sale, 'id'> = {
    customerId,
    date: format(today, 'yyyy-MM-dd'),
    items: items.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    totalAmount,
    paymentMethod,
    status,
    channel,
    salespersonId: salespersonId === 'none' ? undefined : salespersonId,
    location,
    notes,
  };
  const saleRef = await addDoc('sales', saleData);

  if (isConcluded) {
    const movementStatus = isSaleOnCredit ? 'pending' : 'paid';
    const movementDescription = `Venda ${saleRef.id}: ${items.length} item(s) - ${productNames.slice(0, 2).join(', ')}${productNames.length > 2 ? '...' : ''}`;
    const financialMovement: Omit<FinancialMovement, 'id'> = {
      description: movementDescription,
      referenceId: saleRef.id,
      customerId,
      dueDate: isSaleOnCredit ? dueDate : format(today, 'yyyy-MM-dd'),
      paymentDate: movementStatus === 'paid' ? format(today, 'yyyy-MM-dd') : undefined,
      amount: totalAmount,
      status: movementStatus,
      type: 'revenue',
      category: 'vendas',
      sourceAccount,
    };
    await addDoc('financialMovements', financialMovement);

    if (customerId) {
      await updateDoc(doc(db, 'customers', customerId), {
        pendingAmount: isSaleOnCredit ? increment(totalAmount) : increment(0),
        lastPurchaseDate: format(today, 'dd/MM/yyyy'),
        totalOrders: increment(1),
        totalPurchasesValue: increment(totalAmount),
      });
    }
  }

  return {
    message: `Venda ${saleRef.id} no valor de ${totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada com sucesso.`,
    saleId: saleRef.id,
  };
}
