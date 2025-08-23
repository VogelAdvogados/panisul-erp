
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { registerProduction } from '@/services/register-production';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  productId: z.string().min(1, 'Selecione um produto.'),
  quantity: z.coerce.number().int().positive('A quantidade deve ser um número positivo.'),
});

interface RegisterProductionFormProps {
    products: Product[];
    onProductionRegistered: () => void;
}

export function RegisterProductionForm({ products, onProductionRegistered }: RegisterProductionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
        const result = await registerProduction(data);
        toast({
            title: "Produção Registrada!",
            description: result.message,
        });
        form.reset();
        onProductionRegistered();
    } catch(error) {
        toast({
            title: 'Erro ao registrar produção',
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
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto que foi produzido" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                  ))}
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
              <FormLabel>Quantidade Produzida</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Ex: 100" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Registrando...' : 'Confirmar Produção'}
        </Button>
      </form>
    </Form>
  );
}
