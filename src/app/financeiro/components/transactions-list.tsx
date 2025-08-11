
'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { purchases, suppliers, customers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'revenue' | 'expense';
  amount: number;
}

export function TransactionsList() {
    const suppliersMap = new Map(suppliers.map(s => [s.id, s.name]));
    
    const expenses: Transaction[] = purchases.flatMap(p => 
        p.financialMovements
            .filter(fm => fm.status === 'paid' && fm.paymentDate)
            .map(fm => ({
                id: fm.id,
                date: fm.paymentDate!,
                description: `Pagamento Fornecedor: ${suppliersMap.get(p.supplierId) || 'N/A'} - Ref NFE ${p.invoiceNumber}`,
                type: 'expense',
                amount: fm.amount,
            }))
    );
    
    // This is a mock for revenues. In a real app, this would come from sales orders.
    const revenues: Transaction[] = [
        { id: 'REV-001', date: '2024-06-20', description: 'Recebimento Cliente: Padaria Central', type: 'revenue', amount: 1200 },
        { id: 'REV-002', date: '2024-06-19', description: 'Recebimento Cliente: Mercado São João', type: 'revenue', amount: 2500 },
    ];

    const allTransactions = [...expenses, ...revenues].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
            <div>
                <CardTitle>Extrato de Movimentações</CardTitle>
                <CardDescription>Visualize o fluxo de entradas e saídas por conta financeira.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="revenue">Receitas</SelectItem>
                        <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar na descrição..." className="pl-10"/>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {allTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                        <Badge variant={transaction.type === 'revenue' ? 'default' : 'destructive'} className={transaction.type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                             {transaction.type === 'revenue' ? 
                                <ArrowUpCircle className="mr-1 h-3 w-3"/> : 
                                <ArrowDownCircle className="mr-1 h-3 w-3"/>
                            }
                            {transaction.type === 'revenue' ? 'Receita' : 'Despesa'}
                        </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{allTransactions.length}</strong> transações.
            </div>
        </CardFooter>
    </Card>
  );
}
