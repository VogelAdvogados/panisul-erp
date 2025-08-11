
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { add } from 'date-fns';

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
import type { ExpenseCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres.'),
  category: z.string().min(1, 'Selecione uma categoria.'),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
  installments: z.coerce.number().int().min(1).default(1),
  dueDate: z.string().min(1, 'A data de vencimento é obrigatória.'),
});

type ExpenseFormValues = z.infer<typeof formSchema>;

export default function NewExpensePage() {
  const { toast } = useToast();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      category: '',
      amount: 0,
      installments: 1,
      dueDate: add(new Date(), { days: 7 }).toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    // Here you would typically send the data to your backend to save it
    console.log(data);

    toast({
      title: 'Despesa Lançada!',
      description: `${data.description} no valor de ${data.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi registrada com sucesso.`,
    });
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
                      <Textarea placeholder="Ex: Conta de luz, Salário do padeiro..." {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(expenseCategories).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.label}
                            </SelectItem>
                          ))}
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
                            <Input type="number" step="0.01" placeholder="0,00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Data de Vencimento</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Parcelas</FormLabel>
                        <FormControl>
                            <Input type="number" min="1" step="1" {...field} />
                        </FormControl>
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
                <Button type="submit">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Lançar Despesa
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
