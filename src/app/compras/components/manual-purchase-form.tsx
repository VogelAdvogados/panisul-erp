
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

const purchaseItemSchema = z.object({
  ingredientId: z.string().min(1, 'Selecione um insumo.'),
  quantity: z.coerce.number().min(0.01, 'A quantidade deve ser maior que zero.'),
  unitPrice: z.coerce.number().min(0.01, 'O preço deve ser maior que zero.'),
});

const formSchema = z.object({
  supplierId: z.string().min(1, 'Selecione um fornecedor.'),
  invoiceNumber: z.string().optional(),
  date: z.string().min(1, 'A data é obrigatória.'),
  status: z.enum(['pending', 'paid', 'overdue']),
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
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: [{ ingredientId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');
  const totalAmount = watchedItems.reduce((acc, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return acc + quantity * unitPrice;
  }, 0);


  const onSubmit = (data: PurchaseFormValues) => {
    console.log(data);
    toast({
        title: "Compra Lançada com Sucesso!",
        description: `Compra do fornecedor ${suppliers.find(s => s.id === data.supplierId)?.name} no valor de ${totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi registrada.`
    });
    form.reset();
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Lançamento Manual de Compra</CardTitle>
        <CardDescription>Registre uma nova compra de insumos preenchendo os dados abaixo.</CardDescription>
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
                        name="date"
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

                <div className="space-y-4">
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

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status do Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="paid">Pago</SelectItem>
                                <SelectItem value="overdue">Vencida</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="md:col-span-2 flex items-end justify-end">
                        <div className="text-right">
                             <p className="text-muted-foreground">Valor Total da Compra</p>
                             <p className="text-2xl font-bold text-primary">{totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
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
