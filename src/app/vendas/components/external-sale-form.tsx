
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays } from 'date-fns';
import type { Product, Customer, Salesperson, SaleChannel, SourceAccount } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash, PlusCircle, ShoppingCart } from 'lucide-react';
import { registerSale } from '@/ai/flows/register-sale';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto.'),
  quantity: z.coerce.number().min(1, 'A quantidade deve ser maior que zero.'),
  unitPrice: z.coerce.number(), // Price is set automatically
});

const formSchema = z.object({
  customerId: z.string().optional(),
  salespersonId: z.string().min(1, 'Selecione um vendedor.'),
  channel: z.enum(['externa_rota', 'externa_feira', 'externa_entrega']),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['concluida', 'pendente']),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  dueDate: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'Adicione pelo menos um item à venda.'),
});

interface ExternalSaleFormProps {
  products: Product[];
  customers: Customer[];
  salespeople: Salesperson[];
  onSaleRegistered: () => void;
}

export function ExternalSaleForm({ products, customers, salespeople, onSaleRegistered }: ExternalSaleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const productsMap = new Map(products.map(p => [p.id, p]));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 'none',
      salespersonId: '',
      channel: 'externa_rota',
      status: 'concluida',
      paymentMethod: 'dinheiro',
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');
  const totalAmount = watchedItems.reduce((acc, item) => {
    const product = productsMap.get(item.productId);
    const quantity = Number(item.quantity) || 0;
    const unitPrice = product?.price || 0;
    return acc + quantity * unitPrice;
  }, 0);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
        const itemsToSell = data.items.map(item => {
            const product = productsMap.get(item.productId);
            if (!product) throw new Error("Produto inválido no carrinho.");
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
                productName: product.name,
            }
        });

        const sourceAccount = (data.paymentMethod === 'dinheiro' ? 'cash' : 'bank') as SourceAccount;

        const payload = {
            ...data,
            items: itemsToSell,
            totalAmount,
            sourceAccount,
            customerId: data.customerId === 'none' ? undefined : data.customerId,
            dueDate: data.paymentMethod === 'boleto' || data.paymentMethod === 'cartao_credito' ? data.dueDate : undefined,
        };
        
        const result = await registerSale(payload);
        toast({
            title: "Venda Registrada!",
            description: result.message,
        });
        form.reset();
        onSaleRegistered();
    } catch (error) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto pr-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl>
                        <SelectContent>
                        <SelectItem value="none">Consumidor Final</SelectItem>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="salespersonId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Vendedor Responsável</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um vendedor" /></SelectTrigger></FormControl>
                        <SelectContent>
                        {salespeople.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

         <div className="space-y-4 pt-4 border-t">
            <FormLabel>Itens da Venda</FormLabel>
            {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 p-3 border rounded-md relative">
                <div className="col-span-12 md:col-span-6">
                    <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Produto</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-6 md:col-span-2">
                    <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Quantidade</FormLabel>
                                <FormControl><Input type="number" placeholder="Qtd." {...field} disabled={isLoading}/></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="col-span-6 md:col-span-3 flex items-end">
                    <p className="font-medium w-full text-right md:text-left">
                        Subtotal: {(watchedItems[index]?.quantity * (productsMap.get(watchedItems[index]?.productId)?.price || 0) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
                <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isLoading}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })} disabled={isLoading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Item
            </Button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Canal de Venda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="externa_rota">Rota</SelectItem>
                            <SelectItem value="externa_feira">Feira</SelectItem>
                            <SelectItem value="externa_entrega">Entrega</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Localização (Município/Região)</FormLabel>
                    <FormControl><Input placeholder="Ex: Rota Campinas, Feira de Domingo" {...field} disabled={isLoading} /></FormControl>
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
                <FormLabel>Observações Logísticas</FormLabel>
                <FormControl><Textarea placeholder="Ex: Entregar na portaria, cliente ausente após as 18h..." {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                            <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status da Venda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="concluida">Concluída (Gera baixa de estoque/financeiro)</SelectItem>
                            <SelectItem value="pendente">Pendente (Apenas registra a intenção)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <div className='text-right pt-4 border-t'>
            <p className='text-muted-foreground'>Valor Total da Venda</p>
            <p className='font-bold text-2xl text-primary'>{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>

        <div className="w-full flex justify-end">
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                {isLoading ? 'Registrando...' : 'Confirmar Venda'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
