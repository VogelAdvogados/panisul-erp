
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
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { FinancialMovement } from '@/lib/types';

interface LatestTransactionsProps {
    transactions: FinancialMovement[];
}

export function LatestTransactions({ transactions }: LatestTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Movimentações Pagas</CardTitle>
        <CardDescription>Visualize as últimas 5 transações com pagamento confirmado.</CardDescription>
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
                {transactions.map((transaction) => {
                    const isRevenue = transaction.amount > 0;
                    return (
                        <TableRow key={transaction.id}>
                            <TableCell className="text-xs text-muted-foreground">{new Date(transaction.paymentDate!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                                {isRevenue ? 
                                    <ArrowUpCircle className="h-4 w-4 text-green-500"/> : 
                                    <ArrowDownCircle className="h-4 w-4 text-red-500"/>
                                }
                                {transaction.description}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${isRevenue ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                        </TableRow>
                    );
                })}
                 {transactions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                            Nenhuma transação recente encontrada.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
