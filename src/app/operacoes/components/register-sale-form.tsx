
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Product, Customer } from '@/lib/types';
import { registerSale } from '@/ai/flows/register-sale';
import { useState } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const RegisterSaleInputSchema = z.object({
  productId: z.string().describe('The ID of the product being sold.'),
  quantity: z.coerce.number().int().positive().describe('The quantity of the product being sold.'),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  sourceAccount: z.enum(['cash', 'bank']),
  customerId: z.string().optional().describe('The ID of the customer, if applicable.'),
});


interface RegisterSaleFormProps {
    product: Product;
    customers: Customer[];
    onSaleRegistered: () => void;
}

export function RegisterSaleForm({ product, customers, onSaleRegistered }: RegisterSaleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof RegisterSaleInputSchema>>({
    resolver: zodResolver(RegisterSaleInputSchema),
    defaultValues: {
      productId: product.id,
      quantity: 1,
      paymentMethod: 'dinheiro',
      sourceAccount: 'cash',
      customerId: undefined,
    },
  });

  const onSubmit = async (data: z.infer<typeof RegisterSaleInputSchema>) => {
    setIsLoading(true);
    try {
        const payload = {
            ...data,
            customerId: data.customerId === 'none' ? undefined : data.customerId,
        };
        const result = await registerSale(payload);
        toast({
            title: "Venda Registrada!",
            description: result.message,
        });
        form.reset({
             productId: product.id,
            quantity: 1,
            paymentMethod: 'dinheiro',
            sourceAccount: 'cash',
            customerId: undefined,
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
  
  const quantity = form.watch('quantity');
  const paymentMethod = form.watch('paymentMethod');
  const total = (quantity * product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className='p-4 rounded-lg bg-muted/50'>
            <h3 className='font-bold text-lg'>{product.name}</h3>
            <p className='text-sm text-muted-foreground'>Estoque atual: {product.stock} unidades</p>
        </div>

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade Vendida</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 1" {...field} disabled={isLoading} max={product.stock} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente (Opcional)</FormLabel>
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
                        className="flex items-center space-x-4"
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
        
        <div className='text-right'>
            <p className='text-muted-foreground'>Valor Total da Venda</p>
            <p className='font-bold text-2xl text-primary'>{total}</p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading || quantity > product.stock}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <ShoppingCart className="mr-2 h-4 w-4" />}
            {isLoading ? 'Registrando...' : 'Confirmar Venda'}
        </Button>
      </form>
    </Form>
  );
}
