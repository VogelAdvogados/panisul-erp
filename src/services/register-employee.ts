'use server';

import { z } from 'zod';
import { db, addDoc, updateDoc, doc } from '@/lib/netly';
import type { Employee } from '@/lib/types';

const RegisterEmployeeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome é obrigatório'),
  role: z.string().min(1, 'O cargo é obrigatório'),
  salary: z.coerce.number().min(0, 'O salário não pode ser negativo.'),
  admissionDate: z.string().min(1, 'A data de admissão é obrigatória.'),
  status: z.enum(['ativo', 'inativo']),
});
export type RegisterEmployeeInput = z.infer<typeof RegisterEmployeeInputSchema>;

export async function registerEmployee(
  input: RegisterEmployeeInput
): Promise<{ employeeId: string; message: string }> {
  const employeeId = input.id;
  const employeePayload = { ...input };

  if (employeeId) {
    const employeeRef = doc(db, 'employees', employeeId);
    await updateDoc(employeeRef, employeePayload);
    return { employeeId, message: `Funcionário "${input.name}" atualizado com sucesso.` };
  }

  const newEmployeeData: Omit<Employee, 'id'> = { ...employeePayload };
  const employeeRef = await addDoc('employees', newEmployeeData);
  return { employeeId: employeeRef.id, message: `Funcionário "${input.name}" cadastrado com sucesso.` };
}
