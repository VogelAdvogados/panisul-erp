
'use server';

/**
 * @fileOverview Registers or updates a customer in the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import type { Customer } from '@/lib/types';
import { format } from 'date-fns';


const RegisterCustomerInputSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('Email inválido'),
    phone: z.string(),
    doc: z.string(),
    address: z.string(),
    type: z.enum(['pessoa-fisica', 'pessoa-juridica']),
    status: z.enum(['ativo', 'inativo']),
});

const RegisterCustomerOutputSchema = z.object({
  customerId: z.string(),
  message: z.string(),
});

export async function registerCustomer(
  input: z.infer<typeof RegisterCustomerInputSchema>
): Promise<z.infer<typeof RegisterCustomerOutputSchema>> {
  return registerCustomerFlow(input);
}


const registerCustomerFlow = ai.defineFlow(
  {
    name: 'registerCustomerFlow',
    inputSchema: RegisterCustomerInputSchema,
    outputSchema: RegisterCustomerOutputSchema,
  },
  async (input) => {
    let customerId = input.id;
    
    if (customerId) {
        // Update existing customer
        const customerRef = doc(db, 'customers', customerId);
        await updateDoc(customerRef, { ...input });
        return {
            customerId,
            message: `Cliente "${input.name}" atualizado com sucesso.`
        }
    } else {
        // Create new customer
        const customerData: Omit<Customer, 'id'> = {
            ...input,
            registeredAt: format(new Date(), 'yyyy-MM-dd'),
            pendingAmount: 0,
            totalOrders: 0,
            totalPurchasesValue: 0,
            exchanges: 0,
            lastPurchaseDate: '',
        };
        const customerRef = await addDoc(collection(db, 'customers'), customerData);
        return {
            customerId: customerRef.id,
            message: `Cliente "${input.name}" cadastrado com sucesso.`
        }
    }
  }
);

    