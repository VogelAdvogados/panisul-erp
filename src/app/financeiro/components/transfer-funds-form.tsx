// @ts-nocheck

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Repeat } from 'lucide-react';
import { useState } from 'react';
import type { SourceAccount } from '@/lib/types';
import { transferFunds } from '@/services/transfer-funds';

const formSchema = z.object({
  fromAccount: z.custom<SourceAccount>({ required_error: 'Selecione a conta de origem.'}),
  toAccount: z.custom<SourceAccount>({ required_error: 'Selecione a conta de destino.'}),
  amount: z.coerce.number().min(0.01, 'O valor deve ser maior que zero.'),
  date: z.string().min(1, 'A data é obrigatória.'),
  notes: z.string().optional(),
}).refine(data => data.fromAccount !== data.toAccount, {
    message: "A conta de origem e destino não podem ser as mesmas.",
    path: ["toAccount"],
});

interface TransferFundsFormProps {
    onTransferDone: () => void;
}

export function TransferFundsForm({ onTransferDone }: TransferFundsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await transferFunds(data);
      toast({
        title: 'Transferência Realizada!',
        description: result.message,
      });
      form.reset();
      onTransferDone();
    } catch (e) {
      const error = e as Error;
      toast({
        title: 'Erro ao transferir',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="fromAccount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>De</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Conta de Origem" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="cash">Caixa Físico</SelectItem>
                        <SelectItem value="bank">Conta Corrente</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="toAccount"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Para</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Conta de Destino" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="cash">Caixa Físico</SelectItem>
                        <SelectItem value="bank">Conta Corrente</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="0,00" {...field} disabled={isLoading}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data da Transferência</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} disabled={isLoading}/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
         <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                    <Textarea placeholder="Ex: Depósito do caixa diário, sangria..." {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onTransferDone} disabled={isLoading}>
                Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Repeat className="mr-2 h-4 w-4" />
                {isLoading ? 'Transferindo...' : 'Confirmar Transferência'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
