
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FinancialMovement } from '@/lib/types';


export function LatestTransactions() {
  const [latestTransactions, setLatestTransactions] = useState<FinancialMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const movementsRef = collection(db, 'financialMovements');
        // Get the last 5 transactions paid, ordering by paymentDate
        const q = query(movementsRef, orderBy('paymentDate', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        
        const transactions = snapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as FinancialMovement;
        }).filter(t => t.status === 'paid'); // Ensure we only show paid ones
        
        setLatestTransactions(transactions);

      } catch (error) {
        toast({
            title: "Erro ao buscar transações",
            description: "Não foi possível carregar as últimas movimentações.",
            variant: "destructive"
        });
        console.error("Error fetching latest transactions: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [toast]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Movimentações</CardTitle>
        <CardDescription>Visualize as últimas 5 transações realizadas.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
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
                            <TableCell className="text-xs text-muted-foreground">{new Date(transaction.paymentDate!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                                {transaction.amount > 0 ? 
                                    <ArrowUpCircle className="h-4 w-4 text-green-500"/> : 
                                    <ArrowDownCircle className="h-4 w-4 text-red-500"/>
                                }
                                {transaction.description}
                            </TableCell>
                            <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                        </TableRow>
                    ))}
                    {latestTransactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                Nenhuma transação recente encontrada.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}

    
