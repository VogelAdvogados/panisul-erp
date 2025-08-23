
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { CalendarIcon, Sparkles, Loader2, TrendingUp, TrendingDown, Package, Users, BarChart, Info, Lightbulb } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { initialProducts as products } from '@/lib/data';

interface ProductSale {
  productId: string;
  productName: string;
  quantitySold: number;
  totalValue: number;
}

interface ProductInfo {
  id: string;
  name: string;
  stock: number;
}

interface SalesAnalysisInput {
  startDate: string;
  endDate: string;
  salesData: ProductSale[];
  products: ProductInfo[];
}

interface SalesAnalysisOutput {
  summary: string;
  topSellingProducts: ProductSale[];
  lowSellingProducts: ProductSale[];
  trends: string;
  recommendations: string;
}


const formSchema = z.object({
  dateRange: z.object({
    from: z.date({ required_error: 'A data inicial é obrigatória.' }),
    to: z.date({ required_error: 'A data final é obrigatória.' }),
  }),
});

export default function SalesReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SalesAnalysisOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setAnalysis(null);
    try {
        const input: SalesAnalysisInput = {
            startDate: data.dateRange.from.toISOString(),
            endDate: data.dateRange.to.toISOString(),
            salesData: [
                { productId: 'PROD-001', productName: 'Pão Francês', quantitySold: 350, totalValue: 262.50 },
                { productId: 'PROD-002', productName: 'Croissant', quantitySold: 120, totalValue: 420.00 },
                { productId: 'PROD-003', productName: 'Baguete', quantitySold: 80, totalValue: 320.00 },
            ],
            products: products.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
        };

        const topSellingProducts = [...input.salesData].sort((a,b)=>b.quantitySold - a.quantitySold).slice(0,3);
        const lowSellingProducts = [...input.salesData].sort((a,b)=>a.quantitySold - b.quantitySold).slice(0,3);
        const totalRevenue = input.salesData.reduce((sum,p)=>sum+p.totalValue,0);
        const analysis: SalesAnalysisOutput = {
            summary: `Período de ${format(data.dateRange.from, 'dd/MM/yyyy')} a ${format(data.dateRange.to, 'dd/MM/yyyy')} gerou receita total de ${totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
            topSellingProducts,
            lowSellingProducts,
            trends: 'Análise detalhada indisponível.',
            recommendations: 'Sem recomendações automáticas.',
        };
        setAnalysis(analysis);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Relatório de Análise de Vendas com IA" />

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Período</CardTitle>
          <CardDescription>Selecione o período que deseja analisar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Período de Análise</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-[300px] justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, 'd LLL, y', { locale: ptBR })} -{' '}
                                  {format(field.value.to, 'd LLL, y', { locale: ptBR })}
                                </>
                              ) : (
                                format(field.value.from, 'd LLL, y', { locale: ptBR })
                              )
                            ) : (
                              <span>Escolha um período</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={field.value?.from}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="mt-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isLoading ? 'Analisando...' : 'Gerar Análise com IA'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
         <div className="flex flex-col text-center justify-center items-center p-8 rounded-lg border-dashed border-2 mt-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold text-foreground">Analisando dados de vendas com IA...</p>
          <p className="text-muted-foreground">Isso pode levar alguns instantes.</p>
        </div>
      )}

      {analysis && (
        <div className="mt-6 space-y-6">
            <Card className='bg-primary/5'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className='h-5 w-5 text-primary'/>Resumo Executivo</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-muted-foreground'>{analysis.summary}</p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600"><TrendingUp className='h-5 w-5'/>Produtos Mais Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-2 text-sm">
                           {analysis.topSellingProducts.map(p => (
                               <li key={p.productId} className="flex justify-between">
                                   <span>{p.productName}</span>
                                   <span className="font-bold">{p.quantitySold} un.</span>
                               </li>
                           ))}
                       </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600"><TrendingDown className='h-5 w-5'/>Produtos Menos Vendidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ul className="space-y-2 text-sm">
                           {analysis.lowSellingProducts.map(p => (
                               <li key={p.productId} className="flex justify-between">
                                   <span>{p.productName}</span>
                                   <span className="font-bold">{p.quantitySold} un.</span>
                               </li>
                           ))}
                       </ul>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className='h-5 w-5 text-primary'/>Análise Geral de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-muted-foreground whitespace-pre-wrap'>{analysis.trends}</p>
                </CardContent>
            </Card>
             <Card className='bg-amber-50 border-amber-200'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700"><Lightbulb className='h-5 w-5'/>Recomendações Estratégicas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-amber-800 whitespace-pre-wrap'>{analysis.recommendations}</p>
                </CardContent>
            </Card>
        </div>
      )}

    </div>
  );
}
