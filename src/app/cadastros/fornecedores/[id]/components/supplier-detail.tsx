
'use client';

import type { Supplier, Purchase } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Hash, DollarSign, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SupplierDetailProps {
  supplier: Supplier;
  purchases: Purchase[];
}

export function SupplierDetail({ supplier, purchases }: SupplierDetailProps) {
  const totalPurchased = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPaid = purchases
    .flatMap(p => p.financialMovements)
    .filter(fm => fm.status === 'paid')
    .reduce((acc, fm) => acc + fm.amount, 0);
  const pendingAmount = totalPurchased - totalPaid;

  const getOverallStatus = (purchase: Purchase): {variant: 'default' | 'secondary' | 'destructive' | 'outline', text: string} => {
    const total = purchase.financialMovements.length;
    if (total === 0) return { variant: 'outline', text: 'N/A' };
    const paidCount = purchase.financialMovements.filter(m => m.status === 'paid').length;
    const overdueCount = purchase.financialMovements.filter(m => m.status === 'overdue').length;

    if(overdueCount > 0) return { variant: 'destructive', text: 'Vencida' };
    if(paidCount === total) return { variant: 'default', text: 'Paga' };
    if(paidCount > 0 && paidCount < total) return { variant: 'outline', text: 'Parcialmente Paga' };
    return { variant: 'secondary', text: 'Pendente' };
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{supplier.name}</CardTitle>
          <CardDescription>Informações de contato e financeiras.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>CNPJ: {supplier.cnpj}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>Contato: {supplier.contact}</span>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Package className="h-4 w-4"/>Total de Compras</p>
                <p className="text-xl font-bold">{purchases.length}</p>
             </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4"/>Valor Total Comprado</p>
                <p className="text-xl font-bold text-green-800">{totalPurchased.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
             <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-semibold flex items-center gap-1"><DollarSign className="h-4 w-4"/>Saldo Devedor</p>
                <p className="text-xl font-bold text-red-800">{pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>Todas as notas fiscais e compras registradas para este fornecedor.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Nº da Nota</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">Status Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const status = getOverallStatus(purchase);
                return (
                  <TableRow key={purchase.id}>
                    <TableCell>{new Date(purchase.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                    <TableCell className="text-right">
                      {purchase.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-center">
                        <Badge variant={status.variant}>{status.text}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
               {purchases.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma compra registrada para este fornecedor.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

