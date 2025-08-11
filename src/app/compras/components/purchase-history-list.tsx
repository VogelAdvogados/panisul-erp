
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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MoreHorizontal, FileText, Search, CreditCard } from 'lucide-react';
import { purchases as initialPurchases, suppliers as initialSuppliers } from '@/lib/data';
import type { Purchase, Supplier, PaymentMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function PurchaseHistoryList() {
  const [purchases] = useState<Purchase[]>(initialPurchases);
  const [suppliers] = useState<Record<string, Supplier>>(
    initialSuppliers.reduce((acc, s) => ({ ...acc, [s.id]: s }), {})
  );

  const getSupplierName = (supplierId: string) => {
    return suppliers[supplierId]?.name || 'Fornecedor Desconhecido';
  };

  const getStatusVariant = (status: Purchase['status']) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Purchase['status']) => {
    switch (status) {
        case 'paid': return 'Paga';
        case 'pending': return 'Pendente';
        case 'overdue': return 'Vencida';
    }
  }
  
  const getPaymentMethodText = (method: PaymentMethod, installments?: number) => {
    const texts = {
        pix: 'PIX',
        boleto: 'Boleto',
        dinheiro: 'Dinheiro',
        cartao_credito: `Crédito ${installments ? `(${installments}x)` : ''}`,
        cartao_debito: 'Débito'
    }
    return texts[method];
  }


  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
            <div>
                <CardTitle>Histórico de Notas Fiscais</CardTitle>
                <CardDescription>Visualize todas as compras de insumos registradas.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por fornecedor ou nota..." className="pl-10"/>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Nº da Nota</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                    <TableCell>{new Date(purchase.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell className="font-medium">{getSupplierName(purchase.supplierId)}</TableCell>
                    <TableCell>{purchase.invoiceNumber}</TableCell>
                    <TableCell>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-default">
                                    <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                    <span>{getPaymentMethodText(purchase.paymentMethod, purchase.paymentInstallments)}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Pago com {getPaymentMethodText(purchase.paymentMethod, purchase.paymentInstallments)}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TableCell>
                    <TableCell className="text-right">{purchase.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                    <TableCell className="text-center">
                    <Badge variant={getStatusVariant(purchase.status)}>{getStatusText(purchase.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <FileText className='mr-2 h-4 w-4' />
                                    Ver Detalhes
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
