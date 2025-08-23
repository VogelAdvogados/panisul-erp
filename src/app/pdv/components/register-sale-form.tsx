// @ts-nocheck

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
import { registerSale } from '@/services/register-sale';
import { useState, useEffect } from 'react';
import { Loader2, ShoppingCart, UserSearch } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, addDays } from 'date-fns';
import type { CartItem } from '../page';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const RegisterSaleInputSchema = z.object({
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  customerId: z.string().optional().describe('The ID of the customer, if applicable.'),
  installments: z.coerce.number().int().min(1).default(1),
  dueDate: z.string().optional().describe('The due date for credit sales.'),
});


interface RegisterSaleFormProps {
    cart: CartItem[];
    total: number;
    customers: Customer[];
    onSaleRegistered: () => void;
}

type PaymentType = 'a_vista' | 'a_prazo';

export function RegisterSaleForm({ cart, total, customers, onSaleRegistered }: RegisterSaleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('a_vista');
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof RegisterSaleInputSchema>>({
    resolver: zodResolver(RegisterSaleInputSchema),
    defaultValues: {
      paymentMethod: 'dinheiro',
      customerId: 'none',
      installments: 1,
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    },
  });

  const isCreditSale = paymentType === 'a_prazo';

  // Effect to reset payment method when payment type changes
  useEffect(() => {
    if (paymentType === 'a_vista') {
      form.setValue('paymentMethod', 'dinheiro');
      form.setValue('installments', 1);
    } else {
      form.setValue('paymentMethod', 'boleto');
    }
  }, [paymentType, form]);


  const onSubmit = async (data: z.infer<typeof RegisterSaleInputSchema>) => {
    setIsLoading(true);
    try {
        const itemsToSell = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            productName: item.product.name,
        }));
        
        const sourceAccount = data.paymentMethod === 'dinheiro' ? 'cash' : 'bank';
        const isConcluded = form.getValues('status') === 'concluida';

        const payload = {
            ...data,
            items: itemsToSell,
            totalAmount: total,
            sourceAccount: sourceAccount,
            channel: 'interna' as const,
            status: 'concluida' as const,
            customerId: data.customerId === 'none' ? undefined : data.customerId,
            dueDate: isCreditSale ? data.dueDate : undefined,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cliente</FormLabel>
              <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value || field.value === 'none' && "text-muted-foreground"
                      )}
                    >
                      {field.value && field.value !== 'none'
                        ? customers.find(c => c.id === field.value)?.name
                        : "Consumidor Final"}
                      <UserSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="none"
                                onSelect={() => {
                                    form.setValue("customerId", "none");
                                    setIsCustomerPopoverOpen(false);
                                }}
                                >
                                Consumidor Final
                            </CommandItem>
                            {customers.map((customer) => (
                            <CommandItem
                                value={customer.name}
                                key={customer.id}
                                onSelect={() => {
                                    form.setValue("customerId", customer.id);
                                    setIsCustomerPopoverOpen(false);
                                }}
                            >
                                {customer.name}
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="grid grid-cols-2 gap-4">
            <FormItem>
                <FormLabel>Tipo de Pagamento</FormLabel>
                 <RadioGroup
                    value={paymentType}
                    onValueChange={(value) => setPaymentType(value as PaymentType)}
                    className="flex items-center space-x-4 pt-2"
                    disabled={isLoading}
                    >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="a_vista" id="a_vista" />
                        </FormControl>
                        <Label htmlFor="a_vista">À Vista</Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                        <RadioGroupItem value="a_prazo" id="a_prazo" />
                        </FormControl>
                        <Label htmlFor="a_prazo">À Prazo</Label>
                    </FormItem>
                </RadioGroup>
            </FormItem>
             <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {paymentType === 'a_vista' ? (
                                    <>
                                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                                    </>
                                ) : (
                                    <>
                                        <SelectItem value="dinheiro">Dinheiro (a prazo)</SelectItem>
                                        <SelectItem value="pix">PIX (a prazo)</SelectItem>
                                        <SelectItem value="boleto">Boleto</SelectItem>
                                        <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        {isCreditSale && (
            <div className='grid grid-cols-2 gap-4'>
                <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Parcelas</FormLabel>
                    <FormControl>
                        <Input type="number" min="1" step="1" placeholder="Nº de parcelas" {...field} disabled={isLoading || paymentType === 'a_vista'} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Vencimento da 1ª</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} disabled={isLoading}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
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
