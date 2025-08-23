
'use server';

/**
 * @fileOverview Registers a new sale, creating a sale record, updating product stock, 
 * and creating a financial revenue entry. It also handles accounts receivable for sales on credit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, collection, doc, runTransaction, increment, addDoc } from '@/lib/netly';
import type { Product, FinancialMovement, Customer, SourceAccount, Sale, SaleItem, SaleChannel } from '@/lib/types';
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
  dueDate: z.string().optional(), // This indicates a credit sale if present
  status: z.enum(['concluida', 'pendente']),
  channel: z.custom<SaleChannel>(),
  salespersonId: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});


const registerSaleFlow = ai.defineFlow(
  {
    name: 'registerSaleFlow',
    inputSchema: RegisterSaleInputSchema, 
    outputSchema: z.object({
      message: z.string(),
      saleId: z.string(),
    }),
  },
  async (input) => {
    const { items, totalAmount, paymentMethod, sourceAccount, customerId, dueDate, channel, salespersonId, location, notes, status } = input;
    
    // A sale is on credit if a due date is provided.
    const isSaleOnCredit = !!dueDate;

    const { saleId, productNames } = await runTransaction(db, async (transaction) => {
      const productNames: string[] = [];
      const isConcluded = status === 'concluida';

      // Only update stock if the sale is concluded
      if (isConcluded) {
        for (const item of items) {
          const productRef = doc(db, 'products', item.productId);
          const productDoc = await transaction.get(productRef);

          if (!productDoc.exists()) {
            throw new Error(`Produto ${item.productName} não encontrado.`);
          }
          const product = productDoc.data() as Product;

          const currentStock = product.stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${currentStock}, Solicitado: ${item.quantity}`);
          }
          
          // 1. Update product stock and sold count
          transaction.update(productRef, { 
            stock: increment(-item.quantity),
            sold: increment(item.quantity)
          });

          productNames.push(item.productName);
        }
      }
      
      // 2. Create the Sale document
      const today = new Date();
      const saleRef = doc(collection(db, 'sales'));
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
      transaction.set(saleRef, saleData);

      // 3. Create the Financial Movement (revenue) only if the sale is concluded
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
        
        const movementRef = doc(collection(db, 'financialMovements'));
        transaction.set(movementRef, financialMovement);
      }


      // 4. If it's a sale to a specific customer, update their stats
      if (customerId && isConcluded) {
        const customerRef = doc(db, 'customers', customerId);
        const customerDoc = await transaction.get(customerRef);
        if(!customerDoc.exists()){
            throw new Error(`Cliente ${customerId} não encontrado.`);
        }
        transaction.update(customerRef, {
            pendingAmount: isSaleOnCredit ? increment(totalAmount) : increment(0),
            lastPurchaseDate: format(today, 'dd/MM/yyyy'),
            totalOrders: increment(1),
            totalPurchasesValue: increment(totalAmount)
        });
      }

      return { saleId: saleRef.id, productNames };
    });

    return {
      message: `Venda ${saleId} no valor de ${totalAmount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} registrada com sucesso.`,
      saleId,
    };
  }
);


export async function registerSale(
  input: z.infer<typeof RegisterSaleInputSchema>
): Promise<{message: string, saleId: string}> {
  const result = await registerSaleFlow(input);
  return result;
}
