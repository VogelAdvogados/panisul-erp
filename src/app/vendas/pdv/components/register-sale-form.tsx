
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Customer } from '@/lib/types';
import { registerSale } from '@/ai/flows/register-sale';
import { useState } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, addDays } from 'date-fns';
import type { CartItem } from '../page';

const RegisterSaleInputSchema = z.object({
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  sourceAccount: z.enum(['cash', 'bank']),
  customerId: z.string().optional().describe('The ID of the customer, if applicable.'),
  dueDate: z.string().optional().describe('The due date for credit sales.'),
});


interface RegisterSaleFormProps {
    cart: CartItem[];
    total: number;
    customers: Customer[];
    onSaleRegistered: () => void;
}

export function RegisterSaleForm({ cart, total, customers, onSaleRegistered }: RegisterSaleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof RegisterSaleInputSchema>>({
    resolver: zodResolver(RegisterSaleInputSchema),
    defaultValues: {
      paymentMethod: 'dinheiro',
      sourceAccount: 'cash',
      customerId: 'none',
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = async (data: z.infer<typeof RegisterSaleInputSchema>) => {
    setIsLoading(true);
    try {
        const itemsToSell = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            productName: item.product.name,
        }));

        const payload = {
            ...data,
            items: itemsToSell,
            totalAmount: total,
            customerId: data.customerId === 'none' ? undefined : data.customerId,
        };
        const result = await registerSale(payload);
        toast({
            title: "Venda Registrada!",
            description: result.message,
        });
        onSaleRegistered();
    } catch(error) {
        toast({
            title: 'Erro ao registrar venda',
            description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const paymentMethod = form.watch('paymentMethod');
  const isCreditSale = paymentMethod === 'boleto' || paymentMethod === 'cartao_credito';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente (para vendas a prazo)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   <SelectItem value="none">Venda Avulsa / Consumidor Final</SelectItem>
                   {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
            <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Forma de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="boleto">Boleto (A Prazo)</SelectItem>
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
                    <FormItem className="space-y-3">
                    <FormLabel>Destino do Pagamento</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4 pt-2"
                        disabled={isLoading}
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="cash" id="cash" />
                            </FormControl>
                            <Label htmlFor="cash">Caixa Físico</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="bank" id="bank" />
                            </FormControl>
                            <Label htmlFor="bank">Conta Corrente</Label>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
        
        {isCreditSale && (
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}
        
        <div className='text-right'>
            <p className='text-muted-foreground'>Valor Total da Venda</p>
            <p className='font-bold text-2xl text-primary'>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <ShoppingCart className="mr-2 h-4 w-4" />}
            {isLoading ? 'Registrando...' : 'Confirmar Venda'}
        </Button>
      </form>
    </Form>
  );
}
