
'use client';

import type { Supplier, Purchase, FinancialMovement } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Hash, DollarSign, Package, Sparkles, Loader2, CreditCard, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { analyzeSupplierHistory } from '@/ai/flows/analyze-supplier-history';
import { useToast } from '@/hooks/use-toast';

interface SupplierDetailProps {
  supplier: Supplier;
  purchases: Purchase[];
  movements: FinancialMovement[];
}

export function SupplierDetail({ supplier, purchases, movements }: SupplierDetailProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const totalDue = movements.reduce((acc, fm) => acc + fm.amount, 0);
  const totalPaid = movements
    .filter(fm => fm.status === 'paid')
    .reduce((acc, fm) => acc + fm.amount, 0);
  const totalPurchasedValue = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

  // Correct calculation for pending amount based on financial movements
  const pendingAmount = totalDue - totalPaid;

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
        const result = await analyzeSupplierHistory(supplier.id);
        setAnalysis(result.analysis);
    } catch (error) {
        console.error(error);
        toast({
          title: 'Erro na Análise de IA',
          description: error instanceof Error ? error.message : 'Não foi possível gerar a análise do fornecedor.',
          variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }

  const getMovementStatus = (movement: FinancialMovement) => {
    if (movement.status === 'paid') return { variant: 'default', text: 'Pago', icon: CreditCard };
    if (new Date(movement.dueDate) < new Date() && movement.status === 'pending') return { variant: 'destructive', text: 'Vencido', icon: Clock };
    return { variant: 'secondary', text: 'Pendente', icon: Clock };
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{supplier.name}</CardTitle>
              <CardDescription>Informações de contato e financeiras.</CardDescription>
            </div>
             <Button onClick={handleAnalyze} disabled={isLoading} size="sm">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {isLoading ? 'Analisando...' : 'Analisar Histórico com IA'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>CNPJ: {supplier.cnpj}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Contato: {supplier.contact}</span>
            </div>
          </div>
          <Separator />
          {analysis && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4"/> Análise da IA</h4>
                <p className="text-sm text-foreground whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Package className="h-4 w-4"/>Total de Compras</p>
                <p className="text-xl font-bold">{purchases.length}</p>
             </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4"/>Valor Total Comprado</p>
                <p className="text-xl font-bold text-green-800">{totalPurchasedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
             <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4"/>Saldo Devedor</p>
                <p className="text-xl font-bold text-red-800">{Math.abs(pendingAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Contas a Pagar</CardTitle>
          <CardDescription>Todas as movimentações financeiras para este fornecedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-center">Status Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => {
                const status = getMovementStatus(movement);
                return (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="font-medium">{movement.description}</TableCell>
                    <TableCell className="text-right">
                      {movement.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant={status.variant as any}><status.icon className="h-3 w-3 mr-1" />{status.text}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
               {movements.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma conta a pagar registrada para este fornecedor.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
