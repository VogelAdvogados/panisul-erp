'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, FileCheck2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { importPurchaseData, type ImportPurchaseDataOutput } from '@/ai/flows/import-purchase-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  file: z.instanceof(FileList).refine((files) => files.length > 0, 'Um arquivo é necessário.'),
});

export function PurchaseImportForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportPurchaseDataOutput | null>(null);
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
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (event) => {
      try {
        const fileDataUri = event.target?.result as string;
        const response = await importPurchaseData({
          fileDataUri,
          fileType,
        });
        setResult(response);
        toast({
            title: 'Sucesso!',
            description: 'Dados extraídos do documento.',
        })
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Erro ao importar',
          description: 'Não foi possível processar o arquivo. Tente novamente.',
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

  const handleReset = () => {
    setResult(null);
    form.reset();
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Importação Inteligente de Compras</CardTitle>
          <CardDescription>Envie um arquivo XML ou PDF de uma nota fiscal para extrair os dados da compra automaticamente com IA.</CardDescription>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4"/>
                {isLoading ? 'Processando...' : 'Importar Arquivo'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <div className="flex flex-col text-center justify-center items-center p-8 rounded-lg border-dashed border-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold text-foreground">Analisando documento com IA...</p>
          <p className="text-muted-foreground">Isso pode levar alguns instantes.</p>
        </div>
      )}

      {result && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
                <FileCheck2 className="h-6 w-6 text-primary"/>
                <CardTitle>Dados Extraídos com Sucesso</CardTitle>
            </div>
            <CardDescription>Confira os dados extraídos do documento e confirme para lançar no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 bg-muted/50 rounded-lg">
                <div><strong>Fornecedor:</strong><p>{result.purchaseDetails.supplier}</p></div>
                <div><strong>Nº da Nota:</strong><p>{result.purchaseDetails.invoiceNumber}</p></div>
                <div><strong>Data:</strong><p>{new Date(result.purchaseDetails.invoiceDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p></div>
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantidade</TableHead>
                        <TableHead className="text-right">Preço Unitário</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.purchaseDetails.items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className='font-medium'>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell className="text-right">{(item.quantity * item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="text-right font-bold text-xl text-primary">
                Total da Nota: {result.purchaseDetails.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="space-y-3">
                <h4 className="font-semibold">Resumo da Análise de IA</h4>
                <div className='flex items-center gap-2'><CheckCircle2 className="h-4 w-4 text-green-500" /> <span className='text-sm text-muted-foreground'><strong>Validação:</strong> {result.validationResult}</span></div>
                <div className='flex items-center gap-2'><AlertTriangle className="h-4 w-4 text-orange-500" /> <span className='text-sm text-muted-foreground'><strong>Estoque:</strong> {result.stockUpdateResult}</span></div>
                <div className='flex items-center gap-2'><CheckCircle2 className="h-4 w-4 text-green-500" /> <span className='text-sm text-muted-foreground'><strong>Contas a Pagar:</strong> {result.accountsPayableUpdateResult}</span></div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
            <Button>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar e Lançar no Sistema
            </Button>
            <Button variant="ghost" className="ml-2" onClick={handleReset}>Descartar</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
