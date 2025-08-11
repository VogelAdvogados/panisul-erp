
'use client';

import { useState, useEffect } from 'react';
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
import { Search, CreditCard, Wallet, Loader2 } from 'lucide-react';
import type { FinancialMovement } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function SalesHistoryList() {
    const [sales, setSales] = useState<FinancialMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const movementsCollection = collection(db, 'financialMovements');
                const q = query(
                    movementsCollection, 
                    where('category', '==', 'vendas'),
                    orderBy('paymentDate', 'desc')
                );
                const snapshot = await getDocs(q);
                const salesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialMovement));
                setSales(salesList);
            } catch (error) {
                toast({
                    title: "Erro ao buscar histórico de vendas",
                    description: "Não foi possível carregar os dados.",
                    variant: "destructive"
                });
                console.error("Error fetching sales history: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSales();
    }, [toast]);
    
    if (isLoading) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>Histórico de Vendas</CardTitle>
                    <CardDescription>Visualize todas as vendas registradas no sistema.</CardDescription>
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
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Visualize todas as vendas registradas no sistema.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por descrição..." className="pl-10"/>
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
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {sales.map((sale) => {
                return (
                    <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.paymentDate!).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                        <TableCell className="font-medium">{sale.description}</TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-muted-foreground">
                                {sale.sourceAccount === 'cash' ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                                <span>{sale.sourceAccount === 'cash' ? 'Caixa' : 'C/C'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">{sale.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant='default'>Realizada</Badge>
                        </TableCell>
                    </TableRow>
                )
            })}
             {sales.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhuma venda encontrada.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{sales.length}</strong> vendas.
            </div>
        </CardFooter>
    </Card>
  );
}
