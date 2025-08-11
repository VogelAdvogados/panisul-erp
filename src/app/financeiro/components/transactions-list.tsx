
'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
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
import { Search, ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { expenseCategories } from '@/lib/categories';
import type { SourceAccount, FinancialMovement } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'revenue' | 'expense';
  amount: number;
  category: string;
  sourceAccount: SourceAccount;
}

interface TransactionsListProps {
    accountFilter: string | null;
}

export function TransactionsList({ accountFilter }: TransactionsListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                // Fetch paid expenses
                const movementsQuery = query(
                    collection(db, 'financialMovements'), 
                    where('status', '==', 'paid'), 
                    orderBy('paymentDate', 'desc')
                );
                const movementsSnapshot = await getDocs(movementsQuery);
                const expenses = movementsSnapshot.docs.map(doc => {
                    const data = doc.data() as FinancialMovement;
                    return {
                        id: doc.id,
                        date: data.paymentDate!,
                        description: data.description,
                        type: 'expense' as const,
                        amount: data.amount,
                        category: data.category ? expenseCategories[data.category].label : 'N/A',
                        sourceAccount: data.sourceAccount,
                    };
                });

                // This is a mock for revenues. In a real app, this would come from a 'revenues' collection.
                const revenues: Transaction[] = [
                    { id: 'REV-001', date: '2024-06-20', description: 'Recebimento Cliente: Padaria Central', type: 'revenue', amount: 1200, category: 'Vendas', sourceAccount: 'bank' },
                    { id: 'REV-002', date: '2024-06-19', description: 'Recebimento Cliente: Mercado São João', type: 'revenue', amount: 2500, category: 'Vendas', sourceAccount: 'bank' },
                    { id: 'REV-003', date: '2024-06-20', description: 'Venda Balcão', type: 'revenue', amount: 500, category: 'Vendas', sourceAccount: 'cash' },
                ];
                
                const all = [...expenses, ...revenues].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setTransactions(all);

            } catch (error) {
                toast({
                    title: "Erro ao buscar movimentações",
                    description: "Não foi possível carregar os dados.",
                    variant: "destructive"
                });
                console.error("Error fetching transactions: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [toast]);

    const filteredTransactions = useMemo(() => {
        if (!accountFilter) {
            return transactions;
        }
        return transactions.filter(t => t.sourceAccount === accountFilter);
    }, [transactions, accountFilter]);
    
    if (isLoading) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>Extrato de Movimentações</CardTitle>
                 </CardHeader>
                 <CardContent className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
            <div>
                <CardTitle>Extrato de Movimentações</CardTitle>
                <CardDescription>
                    {accountFilter ? `Exibindo movimentações para: ${accountFilter === 'cash' ? 'Caixa Físico' : 'Conta Corrente'}` : 'Visualize o fluxo de entradas e saídas por conta financeira.'}
                </CardDescription>
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
            <TableHead>Conta</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {transaction.sourceAccount === 'cash' ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                            <span>{transaction.sourceAccount === 'cash' ? 'Caixa' : 'C/C'}</span>
                        </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{transaction.category}</Badge></TableCell>
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
             {filteredTransactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">Nenhuma transação encontrada para esta conta.</TableCell>
                </TableRow>
            )}
        </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{filteredTransactions.length}</strong> transações.
            </div>
        </CardFooter>
    </Card>
  );
}

    