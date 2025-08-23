// @ts-nocheck

'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { add, format } from 'date-fns';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { expenseCategories } from '@/lib/categories';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { registerExpense } from '@/services/register-expense';
import { collection, getDocs } from '@/lib/netly';
import type { Employee } from '@/lib/types';


const formSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres.'),
  category: z.string().min(1, 'Selecione uma categoria.'),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
  sourceAccount: z.enum(['cash', 'bank'], { required_error: 'Selecione a conta de origem.'}),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória.'),
  paymentStatus: z.enum(['pending', 'paid']),
  employeeId: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof formSchema>;

export default function NewExpensePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      category: '',
      amount: 0,
      sourceAccount: 'bank',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      paymentStatus: 'paid',
      employeeId: 'none',
    },
  });

  const watchedCategory = useWatch({
    control: form.control,
    name: 'category',
  });

  const shouldShowEmployeeField = ['salarios', 'adiantamentos'].includes(watchedCategory);


  useEffect(() => {
    const fetchEmployees = async () => {
        if (shouldShowEmployeeField) {
            try {
                const employeesSnapshot = (await getDocs(collection('employees'))) as Array<Employee & { id: string }>;
                setEmployees(employeesSnapshot);
            } catch (error) {
                 toast({ title: "Erro ao buscar funcionários", variant: 'destructive' });
            }
        }
    };
    fetchEmployees();
  }, [shouldShowEmployeeField, toast]);

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsLoading(true);
    try {
      const result = await registerExpense(data);
      toast({
        title: 'Despesa Lançada!',
        description: result.message,
      });
      form.reset();
    } catch (e) {
      const error = e as Error;
      toast({
        title: 'Erro ao lançar despesa',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Lançar Nova Despesa" />
      <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Detalhes da Despesa</CardTitle>
              <CardDescription>
                Preencha os campos abaixo para registrar uma nova despesa avulsa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Conta de luz, Salário do padeiro, Adiantamento de viagem..." {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(expenseCategories).map(([key, value]) => {
                             if (key === 'vendas' || key === 'insumos') return null; // Hide from this form
                             return (
                                <SelectItem key={key} value={key}>
                                {value.label}
                                </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Valor Total</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="0,00" {...field} disabled={isLoading}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

               {shouldShowEmployeeField && (
                 <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Funcionário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || employees.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o funcionário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Não vincular</SelectItem>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Data de Vencimento/Pag.</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} disabled={isLoading}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="paid">Já Paga</SelectItem>
                                    <SelectItem value="pending">Pendente (Lançar no Contas a Pagar)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sourceAccount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pagar com</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a conta" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="bank">Conta Corrente</SelectItem>
                                    <SelectItem value="cash">Caixa Físico</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/financeiro?tab=payable">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isLoading ? 'Lançando...' : 'Lançar Despesa'}
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
