
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
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
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'revenue' | 'expense';
  amount: number;
}

export function LatestTransactions() {
  const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const movementsRef = collection(db, 'financialMovements');
        const q = query(movementsRef, where('status', '==', 'paid'), orderBy('paymentDate', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        
        const transactions: Transaction[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                date: data.paymentDate,
                description: data.description,
                type: data.amount > 0 ? 'revenue' : 'expense', // This logic needs adjustment based on your data model
                amount: data.amount,
            }
        });
        
        // This is a placeholder as we don't have a revenues collection yet.
        // A real implementation would fetch from both expenses and revenues collections.
        const revenues: Transaction[] = [
            { id: 'REV-001', date: '2024-06-20', description: 'Recebimento Cliente: Padaria Central', type: 'revenue', amount: 1200 },
            { id: 'REV-002', date: '2024-06-19', description: 'Venda Balcão', type: 'revenue', amount: 450.75 },
        ];
        
        const combined = [...transactions, ...revenues]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        setLatestTransactions(combined);
      } catch (error) {
        console.error("Error fetching latest transactions: ", error);
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
                 {latestTransactions.length === 0 && (
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

    