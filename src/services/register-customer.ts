// @ts-nocheck
'use server';

import { z } from 'zod';
import { db, collection, addDoc, updateDoc, doc } from '@/lib/netly';
import type { Customer } from '@/lib/types';
import { format } from 'date-fns';

const RegisterCustomerInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.string().length(0)).optional(),
  phone: z.string(),
  doc: z.string(),
  address: z.string(),
  type: z.enum(['pessoa-fisica', 'pessoa-juridica']),
  status: z.enum(['ativo', 'inativo']),
  notes: z.string().optional(),
});
export type RegisterCustomerInput = z.infer<typeof RegisterCustomerInputSchema>;

export async function registerCustomer(
  input: RegisterCustomerInput
): Promise<{ customerId: string; message: string }> {
  const customerId = input.id;
  const customerPayload = {
    name: input.name,
    email: input.email || '',
    phone: input.phone,
    doc: input.doc,
    address: input.address,
    type: input.type,
    status: input.status,
    notes: input.notes || '',
  };

  if (customerId) {
    const customerRef = doc(db, 'customers', customerId);
    await updateDoc(customerRef, customerPayload);
    return { customerId, message: `Cliente "${input.name}" atualizado com sucesso.` };
  }

  const newCustomerData: Omit<Customer, 'id'> = {
    ...customerPayload,
    registeredAt: format(new Date(), 'yyyy-MM-dd'),
    pendingAmount: 0,
    totalOrders: 0,
    totalPurchasesValue: 0,
    exchanges: 0,
    lastPurchaseDate: '',
  };
  const customerRef = await addDoc(collection(db, 'customers'), newCustomerData);
  return { customerId: customerRef.id, message: `Cliente "${input.name}" cadastrado com sucesso.` };
}
