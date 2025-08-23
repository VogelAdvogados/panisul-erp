
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Product, Ingredient } from '@/lib/types';
import { adjustStock } from '@/services/adjust-stock';
import { useState } from 'react';
import { Loader2, Package, Droplets, SlidersHorizontal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

const formSchema = z.object({
  itemType: z.enum(['product', 'ingredient']),
  itemId: z.string().min(1, 'Selecione um item.'),
  adjustmentType: z.enum(['entrada', 'saida', 'perda', 'acerto']),
  quantity: z.coerce.number().positive('A quantidade deve ser um número positivo.'),
  notes: z.string().optional(),
});

interface StockAdjustmentFormProps {
  products: Product[];
  ingredients: Ingredient[];
  onAdjustmentDone: () => void;
}

export function StockAdjustmentForm({ products, ingredients, onAdjustmentDone }: StockAdjustmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemType: 'product',
      itemId: '',
      adjustmentType: 'entrada',
      quantity: 1,
    },
  });
  
  const selectedItemType = form.watch('itemType');

  const items = selectedItemType === 'product' ? products : ingredients;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
        const result = await adjustStock(data);
        toast({
            title: "Estoque Ajustado!",
            description: result.message,
        });
        form.reset();
        onAdjustmentDone();
    } catch(error) {
        toast({
            title: 'Erro ao ajustar estoque',
            description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Ajuste Manual de Estoque</CardTitle>
            <CardDescription>
                Use esta ferramenta para fazer correções manuais, registrar perdas ou dar entrada/saída avulsa em itens do estoque.
            </CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <FormField
                    control={form.control}
                    name="itemType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Item</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); form.setValue('itemId', ''); }} defaultValue={field.value} disabled={isLoading}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="product"><div className='flex items-center gap-2'><Package className='h-4 w-4'/>Produtos Acabados</div></SelectItem>
                                <SelectItem value="ingredient"><div className='flex items-center gap-2'><Droplets className='h-4 w-4'/>Insumos/Matéria-prima</div></SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="itemId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Item Específico</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || items.length === 0}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={`Selecione um ${selectedItemType === 'product' ? 'produto' : 'insumo'}`} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {items.map(item => (
                                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="adjustmentType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tipo de Ajuste</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="entrada">Entrada Avulsa</SelectItem>
                                    <SelectItem value="saida">Saída Avulsa</SelectItem>
                                    <SelectItem value="perda">Perda / Quebra</SelectItem>
                                    <SelectItem value="acerto">Acerto de Contagem</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} disabled={isLoading} />
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
                        <FormLabel>Motivo / Observação (Opcional)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Ex: Contagem de estoque mensal, produto vencido..." {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SlidersHorizontal className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Salvando...' : 'Confirmar Ajuste de Estoque'}
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
