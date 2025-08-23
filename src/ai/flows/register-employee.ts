
'use server';

/**
 * @fileOverview Registers or updates an employee in the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, collection, addDoc, updateDoc, doc } from '@/lib/netly';
import type { Employee } from '@/lib/types';
import { format } from 'date-fns';


const RegisterEmployeeInputSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'O nome é obrigatório'),
    role: z.string().min(1, 'O cargo é obrigatório'),
    salary: z.coerce.number().min(0, 'O salário não pode ser negativo.'),
    admissionDate: z.string().min(1, 'A data de admissão é obrigatória.'),
    status: z.enum(['ativo', 'inativo']),
});

const RegisterEmployeeOutputSchema = z.object({
  employeeId: z.string(),
  message: z.string(),
});

export async function registerEmployee(
  input: z.infer<typeof RegisterEmployeeInputSchema>
): Promise<z.infer<typeof RegisterEmployeeOutputSchema>> {
  return registerEmployeeFlow(input);
}


const registerEmployeeFlow = ai.defineFlow(
  {
    name: 'registerEmployeeFlow',
    inputSchema: RegisterEmployeeInputSchema,
    outputSchema: RegisterEmployeeOutputSchema,
  },
  async (input) => {
    let employeeId = input.id;
    
    const employeePayload = { ...input };
    
    if (employeeId) {
        // Update existing employee
        const employeeRef = doc(db, 'employees', employeeId);
        await updateDoc(employeeRef, employeePayload);
        return {
            employeeId,
            message: `Funcionário "${input.name}" atualizado com sucesso.`
        }
    } else {
        // Create new employee
        const newEmployeeData: Omit<Employee, 'id'> = {
            ...employeePayload,
        };
        const employeeRef = await addDoc(collection(db, 'employees'), newEmployeeData);
        return {
            employeeId: employeeRef.id,
            message: `Funcionário "${input.name}" cadastrado com sucesso.`
        }
    }
  }
);
