
'use server';

/**
 * @fileOverview Registers a new sale, updating product stock and creating a financial revenue entry.
 * It also handles accounts receivable for sales on credit.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, doc, runTransaction, addDoc, increment } from 'firebase/firestore';
import type { Product, FinancialMovement, Customer } from '@/lib/types';
import { format } from 'date-fns';

const RegisterSaleInputSchema = z.object({
  productId: z.string().describe('The ID of the product being sold.'),
  quantity: z.number().int().positive().describe('The quantity of the product being sold.'),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  sourceAccount: z.enum(['cash', 'bank']),
  customerId: z.string().optional().describe('The ID of the customer, if applicable.'),
});
type RegisterSaleInput = z.infer<typeof RegisterSaleInputSchema>;

const RegisterSaleOutputSchema = z.object({
  message: z.string(),
  saleId: z.string(),
});
type RegisterSaleOutput = z.infer<typeof RegisterSaleOutputSchema>;

export async function registerSale(
  input: RegisterSaleInput
): Promise<RegisterSaleOutput> {
  return registerSaleFlow(input);
}

const registerSaleFlow = ai.defineFlow(
  {
    name: 'registerSaleFlow',
    inputSchema: RegisterSaleInputSchema,
    outputSchema: RegisterSaleOutputSchema,
  },
  async ({ productId, quantity, paymentMethod, sourceAccount, customerId }) => {
    
    const saleId = await runTransaction(db, async (transaction) => {
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
      
      const newStock = currentStock - quantity;
      const newSold = (product.sold || 0) + quantity;

      // 1. Update product stock and sold count
      transaction.update(productRef, { 
        stock: newStock,
        sold: newSold
      });

      // 2. Create the Financial Movement (revenue)
      const saleAmount = product.price * quantity;
      const today = new Date();
      const isSaleOnCredit = paymentMethod === 'boleto';
      const status = isSaleOnCredit ? 'pending' : 'paid';

      const financialMovement: Omit<FinancialMovement, 'id'> = {
        description: `Venda de ${quantity}x ${product.name}`,
        referenceId: customerId || productId, 
        dueDate: format(today, 'yyyy-MM-dd'),
        paymentDate: status === 'paid' ? format(today, 'yyyy-MM-dd') : undefined,
        amount: saleAmount,
        status: status,
        type: 'revenue',
        category: 'vendas',
        sourceAccount,
      };
      const movementRef = await addDoc(collection(db, 'financialMovements'), financialMovement);

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

      return movementRef.id;
    });

    return {
      message: `Venda de ${quantity} unidade(s) do produto ${(await getDoc(doc(db, 'products', productId))).data()?.name} registrada com sucesso.`,
      saleId: saleId,
    };
  }
);
