
'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { initialFinancialMovements } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'revenue' | 'expense';
  amount: number;
}

export function LatestTransactions() {

  const expenses: Transaction[] = initialFinancialMovements
      .filter(fm => fm.status === 'paid' && fm.paymentDate)
      .map(fm => ({
        id: fm.id,
        date: fm.paymentDate!,
        description: fm.description,
        type: 'expense',
        amount: fm.amount,
      }));

  const revenues: Transaction[] = [
    { id: 'REV-001', date: '2024-06-20', description: 'Recebimento Cliente: Padaria Central', type: 'revenue', amount: 1200 },
    { id: 'REV-002', date: '2024-06-19', description: 'Venda Balcão', type: 'revenue', amount: 450.75 },
    { id: 'REV-003', date: '2024-06-18', description: 'Recebimento Cliente: Mercado São João', type: 'revenue', amount: 2500 },
  ];
  
  const latestTransactions = [...expenses, ...revenues]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Movimentações</CardTitle>
        <CardDescription>Visualize as últimas 5 transações realizadas.</CardDescription>
      </CardHeader>
      <CardContent>
         <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {latestTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                        <TableCell className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                        <TableCell className="font-medium flex items-center gap-2">
                             {transaction.type === 'revenue' ? 
                                <ArrowUpCircle className="h-4 w-4 text-green-500"/> : 
                                <ArrowDownCircle className="h-4 w-4 text-red-500"/>
                            }
                            {transaction.description}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
