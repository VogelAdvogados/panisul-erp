
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
import { purchases, suppliers } from '@/lib/data';
import type { FinancialMovement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ExtendedFinancialMovement = FinancialMovement & {
  supplierName: string;
  invoiceNumber: string;
  purchaseDate: string;
}

export function AccountsPayable() {
    const suppliersMap = new Map(suppliers.map(s => [s.id, s.name]));

    const allMovements: ExtendedFinancialMovement[] = purchases.flatMap(p => 
        p.financialMovements.map(fm => ({
            ...fm,
            supplierName: suppliersMap.get(p.supplierId) || 'Desconhecido',
            invoiceNumber: p.invoiceNumber,
            purchaseDate: p.date,
        }))
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const getStatus = (movement: FinancialMovement) => {
        if(movement.status === 'paid') return { variant: 'default', text: 'Pago', icon: CheckCircle };
        if (new Date(movement.dueDate) < new Date() && movement.status === 'pending') return { variant: 'destructive', text: 'Vencido', icon: Clock };
        return { variant: 'secondary', text: 'Pendente', icon: Clock };
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
                <Input placeholder="Buscar por fornecedor ou nota..." className="pl-10"/>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Data de Vencimento</TableHead>
            <TableHead>Nota Fiscal</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {allMovements.map((movement) => {
                const statusInfo = getStatus(movement);
                return (
                    <TableRow key={movement.id}>
                        <TableCell className="font-medium">{movement.supplierName}</TableCell>
                        <TableCell>{new Date(movement.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                        <TableCell>{movement.invoiceNumber}</TableCell>
                        <TableCell className="text-right">{movement.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={statusInfo.variant}>
                                <statusInfo.icon className="mr-1 h-3 w-3"/>
                                {statusInfo.text}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm">Pagar</Button>
                        </TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Exibindo <strong>{allMovements.length}</strong> contas.
            </div>
        </CardFooter>
    </Card>
  );
}
