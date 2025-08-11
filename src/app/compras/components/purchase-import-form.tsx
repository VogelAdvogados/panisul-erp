
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { importPurchaseData } from '@/ai/flows/import-purchase-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  file: z.any().refine((files) => files?.length > 0, 'Um arquivo é necessário.'),
});

export function PurchaseImportForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const file = data.file[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xml' && fileType !== 'pdf') {
      toast({
        variant: 'destructive',
        title: 'Formato de arquivo inválido',
        description: 'Por favor, envie um arquivo XML ou PDF.',
      });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      try {
        const fileDataUri = event.target?.result as string;
        const response = await importPurchaseData({
          fileDataUri,
          fileType,
        });
        toast({
            title: 'Importação Concluída!',
            description: response.message,
        })
        form.reset();
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erro na Automação',
          description: error instanceof Error ? error.message : 'Não foi possível processar e salvar o arquivo automaticamente.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Erro ao ler arquivo',
          description: 'Não foi possível ler o arquivo selecionado.',
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Importação Inteligente e Automática de Compras</CardTitle>
          <CardDescription>Envie um arquivo XML ou PDF de uma nota fiscal. A IA irá extrair os dados, registrar a compra, atualizar o estoque e lançar a conta a pagar automaticamente.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arquivo da Nota Fiscal</FormLabel>
                    <FormControl>
                        <Input
                          type="file"
                          accept=".xml,.pdf"
                          onChange={(e) => field.onChange(e.target.files)}
                          disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4"/>
                {isLoading ? 'Processando e Salvando...' : 'Importar e Automatizar'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
