
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilePlus2, Trash, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PaymentMethod, SourceAccount, Supplier, Ingredient } from '@/lib/types';
import { add, addDays, format } from 'date-fns';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { registerManualPurchase } from '@/ai/flows/register-manual-purchase';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const purchaseItemSchema = z.object({
  ingredientId: z.string().min(1, 'Selecione um insumo.'),
  quantity: z.coerce.number().min(0.01, 'A quantidade deve ser maior que zero.'),
  unitPrice: z.coerce.number().min(0.01, 'O preço deve ser maior que zero.'),
});

const formSchema = z.object({
  supplierId: z.string().min(1, 'Selecione um fornecedor.'),
  invoiceNumber: z.string().optional(),
  date: z.string().min(1, 'A data da compra é obrigatória.'),
  sourceAccount: z.enum(['cash', 'bank'], { required_error: 'Selecione a conta de origem.'}),
  paymentMethod: z.enum(['pix', 'boleto', 'dinheiro', 'cartao_credito', 'cartao_debito']),
  installments: z.coerce.number().int().min(1, 'Pelo menos uma parcela é necessária.').default(1),
  firstDueDate: z.string().min(1, 'A data de vencimento da primeira parcela é obrigatória.'),
  items: z.array(purchaseItemSchema).min(1, 'Adicione pelo menos um item à compra.'),
});

export type ManualPurchaseFormInput = z.infer<typeof formSchema>;
type PaymentType = 'a_vista' | 'a_prazo';

export function ManualPurchaseForm() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('a_prazo');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
        setIsDataLoading(true);
        try {
            const [suppliersSnapshot, ingredientsSnapshot] = await Promise.all([
                getDocs(collection(db, 'suppliers')),
                getDocs(collection(db, 'ingredients'))
            ]);
            setSuppliers(suppliersSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Supplier)));
            setIngredients(ingredientsSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Ingredient)));
        } catch (error) {
            toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar fornecedores e insumos."})
        } finally {
            setIsDataLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const form = useForm<ManualPurchaseFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
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

  // Effect to automatically set source account based on payment method
  useEffect(() => {
    if (paymentMethod === 'dinheiro') {
      form.setValue('sourceAccount', 'cash');
    } else {
      form.setValue('sourceAccount', 'bank');
    }
  }, [paymentMethod, form]);

  // Effect to manage installments and payment method when payment type changes
  useEffect(() => {
    if (paymentType === 'a_vista') {
      form.setValue('installments', 1);
      form.setValue('paymentMethod', 'dinheiro');
    } else {
      form.setValue('paymentMethod', 'boleto');
    }
  }, [paymentType, form]);


  const onSubmit = async (data: ManualPurchaseFormInput) => {
    setIsSubmitting(true);
    try {
        const result = await registerManualPurchase({...data, totalAmount });
        toast({
            title: "Compra Lançada com Sucesso!",
            description: result.message,
        });
        form.reset();
    } catch(e) {
        const error = e as Error;
        toast({
            title: "Erro ao lançar compra",
            description: error.message,
            variant: 'destructive',
        })
    } finally {
        setIsSubmitting(false);
    }
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
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDataLoading || isSubmitting}>
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
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Data da Compra</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} disabled={isSubmitting}/>
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
                                <Input placeholder="Ex: NFE-12345" {...field} disabled={isSubmitting}/>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isDataLoading || isSubmitting}>
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
                                        <FormControl><Input type="number" placeholder="Qtd." {...field} disabled={isSubmitting}/></FormControl>
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
                                        <FormControl><Input type="number" step="0.01" placeholder="Preço" {...field} disabled={isSubmitting}/></FormControl>
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
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isSubmitting}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ ingredientId: '', quantity: 1, unitPrice: 0 })} disabled={isSubmitting}>
                        <FilePlus2 className="mr-2 h-4 w-4" />
                        Adicionar Item
                    </Button>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t">
                    <FormItem>
                        <FormLabel>Tipo de Pagamento</FormLabel>
                        <RadioGroup
                            value={paymentType}
                            onValueChange={(value) => setPaymentType(value as PaymentType)}
                            className="flex items-center space-x-4 pt-2"
                            disabled={isSubmitting}
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="a_vista" id="a_vista_compra" />
                                </FormControl>
                                <Label htmlFor="a_vista_compra">À Vista</Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="a_prazo" id="a_prazo_compra" />
                                </FormControl>
                                <Label htmlFor="a_prazo_compra">À Prazo</Label>
                            </FormItem>
                        </RadioGroup>
                    </FormItem>
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Forma de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                     <FormField
                        control={form.control}
                        name="installments"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Parcelas</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" step="1" placeholder="Nº de parcelas" {...field} disabled={isSubmitting || paymentType === 'a_vista'} />
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
                                <Input type="date" {...field} disabled={isSubmitting}/>
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
                 <Button type="submit" disabled={isDataLoading || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Lançando...' : 'Lançar Compra'}
                </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
