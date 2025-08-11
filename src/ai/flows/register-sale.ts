
'use server';

/**
 * @fileOverview Registers a new sale, updating product stock and creating a financial revenue entry.
 * It also handles accounts receivable for sales on credit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, addDoc, increment, getDoc } from 'firebase/firestore';
import type { Product, FinancialMovement, Customer } from '@/lib/types';
import { format } from 'date-fns';

const registerSaleFlow = ai.defineFlow(
  {
    name: 'registerSaleFlow',
    inputSchema: z.any(), // Input is now defined in the component
    outputSchema: z.object({
      message: z.string(),
      saleId: z.string(),
    }),
  },
  async (input) => {
    const { productId, quantity, paymentMethod, sourceAccount, customerId, dueDate } = input;
    
    const { productName } = await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'products', productId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error(`Produto ${productId} não encontrado.`);
      }
      const product = productDoc.data() as Product;

      const currentStock = product.stock || 0;
      if (currentStock < quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${currentStock}, Solicitado: ${quantity}`);
      }
      
      // 1. Update product stock and sold count
      transaction.update(productRef, { 
        stock: increment(-quantity),
        sold: increment(quantity)
      });

      // 2. Create the Financial Movement (revenue)
      const saleAmount = product.price * quantity;
      const today = new Date();
      // Credit sales create a pending receivable. Others are considered paid immediately.
      const isSaleOnCredit = paymentMethod === 'boleto' || paymentMethod === 'cartao_credito';
      const status = isSaleOnCredit ? 'pending' : 'paid';

      const financialMovement: Omit<FinancialMovement, 'id'> = {
        description: `Venda de ${quantity}x ${product.name}`,
        // If there's a customer, link to them. Otherwise, link to the product.
        referenceId: customerId || productId, 
        // Use the provided due date for credit sales, otherwise today.
        dueDate: isSaleOnCredit ? (dueDate || format(today, 'yyyy-MM-dd')) : format(today, 'yyyy-MM-dd'),
        // Set payment date only if it's not a credit sale
        paymentDate: status === 'paid' ? format(today, 'yyyy-MM-dd') : undefined,
        amount: saleAmount,
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
            pendingAmount: increment(saleAmount),
            lastPurchaseDate: format(today, 'dd/MM/yyyy')
        });
      }

      return { saleId: movementRef.id, productName: product.name };
    });

    return {
      message: `Venda de ${quantity} unidade(s) do produto ${productName} registrada com sucesso.`,
      saleId: 'some-id' // This needs to be fixed to return the actual id
    };
  }
);


export async function registerSale(
  input: z.infer<typeof z.any>
): Promise<{message: string, saleId: string}> {
  const result = await registerSaleFlow(input);
  // The flow now returns the result directly.
  return result;
}
