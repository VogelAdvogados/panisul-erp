
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
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
import { Search, CheckCircle, Clock, Loader2 } from 'lucide-react';
import type { FinancialMovement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { expenseCategories } from '@/lib/categories';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { settleExpense } from '@/ai/flows/settle-expense';

export function AccountsPayable() {
    const [movements, setMovements] = useState<FinancialMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSettling, setIsSettling] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchMovements = useCallback(async () => {
        setIsLoading(true);
        try {
            const movementsCollection = collection(db, 'financialMovements');
            const q = query(
                movementsCollection, 
                where('type', '==', 'expense'),
                orderBy('dueDate', 'asc')
            );
            const snapshot = await getDocs(q);
            const movementList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialMovement));
            setMovements(movementList);
        } catch (error) {
            toast({
                title: "Erro ao buscar contas a pagar",
                description: "Não foi possível carregar os dados.",
                variant: "destructive"
            });
            console.error("Error fetching financial movements: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);


    const getStatus = (movement: FinancialMovement) => {
        if (movement.status === 'paid') return { variant: 'default', text: 'Pago', icon: CheckCircle };
        if (new Date(movement.dueDate) < new Date() && movement.status === 'pending') return { variant: 'destructive', text: 'Vencido', icon: Clock };
        return { variant: 'secondary', text: 'Pendente', icon: Clock };
    }
    
    const handleSettleExpense = async (movementId: string) => {
        setIsSettling(movementId);
        try {
            const result = await settleExpense({ movementId });
            toast({
                title: 'Sucesso!',
                description: result.message
            });
            await fetchMovements(); // refetch to show updated status
        } catch (error) {
            toast({
                title: "Erro ao dar baixa",
                description: (error as Error).message,
                variant: "destructive"
            });
        } finally {
            setIsSettling(null);
        }
    }
    
    if (isLoading) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>Contas a Pagar</CardTitle>
                    <CardDescription>Gerencie suas despesas e pagamentos pendentes.</CardDescription>
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
                <CardTitle>Contas a Pagar</CardTitle>
                <CardDescription>Gerencie suas despesas e pagamentos pendentes.</CardDescription>
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
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data de Vencimento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {movements.map((movement) => {
                const statusInfo = getStatus(movement);
                const category = movement.category ? expenseCategories[movement.category] : { label: 'N/A' };
                return (
                    <TableRow key={movement.id}>
                        <TableCell className="font-medium">{movement.description}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{category.label}</Badge>
                        </TableCell>
                        <TableCell>{new Date(movement.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                        <TableCell className="text-right">{movement.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={statusInfo.variant}>
                                <statusInfo.icon className="mr-1 h-3 w-3"/>
                                {statusInfo.text}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           {movement.status !== 'paid' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="outline" size="sm" disabled={isSettling === movement.id}>
                                        {isSettling === movement.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Pagar'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Pagamento?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Você está prestes a marcar a despesa "{movement.description}" no valor de {movement.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} como paga. Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleSettleExpense(movement.id)}>
                                            Confirmar Pagamento
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                           )}
                        </TableCell>
                    </TableRow>
                )
            })}
             {movements.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhuma conta a pagar encontrada.
                        </TableCell>
                    </TableRow>
                )}
        </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{movements.length}</strong> contas.
            </div>
        </CardFooter>
    </Card>
  );
}
