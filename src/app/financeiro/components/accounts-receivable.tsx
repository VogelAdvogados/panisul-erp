
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, db } from '@/lib/netly';
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
import { MoreHorizontal, Search, CheckCircle, Clock, Loader2 } from 'lucide-react';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function AccountsReceivable() {
  const [accounts, setAccounts] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReceivables = async () => {
      setIsLoading(true);
      try {
        const accountsList = ((await getDocs(collection(db, 'customers'))) as Array<Customer & { id: string }>).
          filter(c => c.pendingAmount > 0);
        setAccounts(accountsList);
      } catch (error) {
        toast({
            title: "Erro ao buscar contas a receber",
            description: "Não foi possível carregar os dados.",
            variant: "destructive"
        });
        console.error("Error fetching receivables: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceivables();
  }, [toast]);
  
  if (isLoading) {
    return (
        <Card>
             <CardHeader>
                <CardTitle>Contas a Receber</CardTitle>
                <CardDescription>Acompanhe seus recebimentos e clientes devedores.</CardDescription>
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
                <CardTitle>Contas a Receber</CardTitle>
                <CardDescription>Acompanhe seus recebimentos e clientes devedores.</CardDescription>
            </div>
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por cliente..." className="pl-10"/>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Data do Último Pedido</TableHead>
            <TableHead className="text-right">Valor Pendente</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {accounts.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.lastPurchaseDate}</TableCell>
                    <TableCell className="text-right">{customer.pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="destructive">
                            <Clock className="mr-1 h-3 w-3"/>
                            Pendente
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/clientes?open=${customer.id}`}>Ver Ficha</Link>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
             {accounts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">Nenhuma conta a receber pendente.</TableCell>
                </TableRow>
            )}
        </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{accounts.length}</strong> contas.
            </div>
        </CardFooter>
    </Card>
  );
}
