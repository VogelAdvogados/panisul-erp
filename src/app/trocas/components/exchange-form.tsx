
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { useState } from 'react';
import { Loader2, Repeat } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  returnedProductId: z.string().min(1, 'Selecione o produto devolvido.'),
  newProductId: z.string().min(1, 'Selecione o produto entregue.'),
  reason: z.string().min(5, 'O motivo deve ter pelo menos 5 caracteres.'),
  returnedProductStatus: z.enum(['restock', 'discard']),
});

interface ExchangeFormProps {
    products: Product[];
    onExchangeRegistered: () => void;
}

export function ExchangeForm({ products, onExchangeRegistered }: ExchangeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      returnedProductId: '',
      newProductId: '',
      reason: '',
      returnedProductStatus: 'discard',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
        // Here you would call a new Genkit flow `registerExchange`
        // For now, we simulate the logic and show a toast
        console.log("Registering exchange:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: "Troca Registrada!",
            description: "O estoque foi ajustado com sucesso.",
        });
        form.reset();
        onExchangeRegistered();
    } catch(error) {
        toast({
            title: 'Erro ao registrar troca',
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
          name="returnedProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto Devolvido pelo Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="returnedProductStatus"
            render={({ field }) => (
                <FormItem className="space-y-2">
                <FormLabel>Condição do Produto Devolvido</FormLabel>
                <FormControl>
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center gap-4"
                    disabled={isLoading}
                    >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="discard" id="discard" /></FormControl>
                            <Label htmlFor="discard">Descartar (perda)</Label>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="restock" id="restock" /></FormControl>
                            <Label htmlFor="restock">Retornar ao estoque</Label>
                        </FormItem>
                    </RadioGroup>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="newProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Novo Produto Entregue ao Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Troca</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Produto amassado, cliente insatisfeito..." {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Repeat className="mr-2 h-4 w-4" />}
            {isLoading ? 'Registrando...' : 'Confirmar Troca'}
        </Button>
      </form>
    </Form>
  );
}

