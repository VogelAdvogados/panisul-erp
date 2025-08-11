
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
import { MoreHorizontal, Search, CheckCircle, Clock } from 'lucide-react';
import { customers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccountsReceivable() {
  const accounts = customers.filter(c => c.pendingAmount > 0);

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
                        <Button variant="outline" size="sm">Receber</Button>
                    </TableCell>
                </TableRow>
            ))}
             {accounts.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma conta a receber pendente.</TableCell>
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
