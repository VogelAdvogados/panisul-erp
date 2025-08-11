
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { suppliers as initialSuppliers, ingredients as initialIngredients } from '@/lib/data';
import { FilePlus2, Trash, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PaymentMethod, SourceAccount } from '@/lib/types';
import { add, addDays } from 'date-fns';

const purchaseItemSchema = z.object({
  ingredientId: z.string().min(1, 'Selecione um insumo.'),
  quantity: z.coerce.number().min(0.01, 'A quantidade deve ser maior que zero.'),
  unitPrice: z.coerce.number().min(0.01, 'O preço deve ser maior que zero.'),
});

const formSchema = z.object({
  supplierId: z.string().min(1, 'Selecione um fornecedor.'),
  invoiceNumber: z.string().optional(),
  purchaseDate: z.string().min(1, 'A data da compra é obrigatória.'),
  sourceAccount: z.enum(['cash', 'bank'], { required_error: 'Selecione a conta de origem.'}),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  installments: z.coerce.number().int().min(1, 'Pelo menos uma parcela é necessária.').default(1),
  firstDueDate: z.string().min(1, 'A data de vencimento da primeira parcela é obrigatória.'),
  items: z.array(purchaseItemSchema).min(1, 'Adicione pelo menos um item à compra.'),
});

type PurchaseFormValues = z.infer<typeof formSchema>;

export function ManualPurchaseForm() {
  const [suppliers] = useState(initialSuppliers);
  const [ingredients] = useState(initialIngredients);
  const { toast } = useToast();

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: '',
      invoiceNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      sourceAccount: 'bank',
      paymentMethod: 'boleto',
      installments: 1,
      firstDueDate: add(new Date(), {days: 30}).toISOString().split('T')[0],
      items: [{ ingredientId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');
  const paymentMethod = form.watch('paymentMethod');
  const totalAmount = watchedItems.reduce((acc, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return acc + quantity * unitPrice;
  }, 0);


  const onSubmit = (data: PurchaseFormValues) => {
    const financialMovements = [];
    const installmentValue = totalAmount / data.installments;

    for (let i = 0; i < data.installments; i++) {
        // Correctly calculate due date for each installment
        const dueDate = addDays(new Date(data.firstDueDate), i * 30);
        financialMovements.push({
            id: `FM-${Date.now()}-${i}`,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: installmentValue,
            status: 'pending',
            sourceAccount: data.sourceAccount, // Add source account
        });
    }

    console.log({
        purchaseData: data,
        calculatedTotal: totalAmount,
        generatedFinancialMovements: financialMovements,
    });
    
    toast({
        title: "Compra Lançada com Sucesso!",
        description: `Compra de ${totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada com ${data.installments} parcela(s). As contas a pagar foram geradas.`,
    });
    form.reset();
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Lançamento Manual de Compra</CardTitle>
        <CardDescription>Registre uma nova compra de insumos e suas condições de pagamento.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um fornecedor" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {suppliers.map(supplier => (
                                <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="purchaseDate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Data da Compra</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nº da Nota Fiscal (Opcional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: NFE-12345" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <FormLabel>Itens da Compra</FormLabel>
                    {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-x-4 gap-y-2 p-3 border rounded-md relative">
                        <div className="col-span-12 md:col-span-5">
                            <FormField
                                control={form.control}
                                name={`items.${index}.ingredientId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Insumo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                             <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um insumo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ingredients.map(ing => (
                                                    <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
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
                                        <FormControl><Input type="number" placeholder="Qtd." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                             <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                     <FormItem>
                                        <FormLabel className="sr-only">Preço Unitário</FormLabel>
                                        <FormControl><Input type="number" step="0.01" placeholder="Preço" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="col-span-12 md:col-span-2 flex items-end">
                             <p className="font-medium w-full text-right md:text-left">
                                Subtotal: {(watchedItems[index]?.quantity * watchedItems[index]?.unitPrice || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             </p>
                        </div>
                        <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ ingredientId: '', quantity: 1, unitPrice: 0 })}>
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        Adicionar Item
                    </Button>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t">
                    <FormField
                        control={form.control}
                        name="sourceAccount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pagar com</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Forma de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a forma" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="boleto">Boleto</SelectItem>
                                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
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
                        name="installments"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Parcelas</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" step="1" placeholder="Nº de parcelas" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="firstDueDate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Venc. da 1ª Parcela</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                 <div className='flex justify-end'>
                    <div className="text-right">
                        <p className="text-muted-foreground">Valor Total da Compra</p>
                        <p className="text-2xl font-bold text-primary">{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                 </div>

            </CardContent>
            <CardFooter>
                 <Button type="submit">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Lançar Compra
                </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
