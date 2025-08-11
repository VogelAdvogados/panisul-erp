
'use server';

/**
 * @fileOverview Registers a new sale, updating product stock and creating a financial revenue entry.
 * It also handles accounts receivable for sales on credit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, increment } from 'firebase/firestore';
import type { Product, FinancialMovement, Customer } from '@/lib/types';
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
  sourceAccount: z.enum(['cash', 'bank']),
  customerId: z.string().optional(),
  dueDate: z.string().optional(),
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
    const { items, totalAmount, paymentMethod, sourceAccount, customerId, dueDate } = input;
    
    const { saleId, productNames } = await runTransaction(db, async (transaction) => {
      const productNames: string[] = [];

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
      
      // 2. Create the Financial Movement (revenue)
      const today = new Date();
      const isSaleOnCredit = paymentMethod === 'boleto' || paymentMethod === 'cartao_credito';
      const status = isSaleOnCredit ? 'pending' : 'paid';

      const financialMovement: Omit<FinancialMovement, 'id'> = {
        description: `Venda de ${items.length} item(s): ${productNames.slice(0, 2).join(', ')}${productNames.length > 2 ? '...' : ''}`,
        referenceId: customerId || undefined, 
        dueDate: isSaleOnCredit ? (dueDate || format(today, 'yyyy-MM-dd')) : format(today, 'yyyy-MM-dd'),
        paymentDate: status === 'paid' ? format(today, 'yyyy-MM-dd') : undefined,
        amount: totalAmount,
        status: status,
        type: 'revenue',
        category: 'vendas',
        sourceAccount,
      };
      
      const movementRef = doc(collection(db, 'financialMovements'));
      transaction.set(movementRef, financialMovement);

      // 3. If it's a sale on credit to a specific customer, update their pending amount
      if (customerId && isSaleOnCredit) {
        const customerRef = doc(db, 'customers', customerId);
        const customerDoc = await transaction.get(customerRef);
        if(!customerDoc.exists()){
            throw new Error(`Cliente ${customerId} não encontrado.`);
        }
        transaction.update(customerRef, {
            pendingAmount: increment(totalAmount),
            lastPurchaseDate: format(today, 'dd/MM/yyyy')
        });
      }

      return { saleId: movementRef.id, productNames };
    });

    return {
      message: `Venda de ${items.length} item(s) no valor de ${totalAmount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} registrada com sucesso.`,
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
