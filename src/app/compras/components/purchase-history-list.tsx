
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
import type { Purchase, Supplier, PaymentMethod, FinancialMovement } from '@/lib/types';
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
  
  const getOverallStatus = (movements: FinancialMovement[]): {variant: 'default' | 'secondary' | 'destructive' | 'outline', text: string} => {
    const total = movements.length;
    if (total === 0) return { variant: 'outline', text: 'N/A' };
    const paidCount = movements.filter(m => m.status === 'paid').length;
    const overdueCount = movements.filter(m => m.status === 'overdue').length;

    if(overdueCount > 0) return { variant: 'destructive', text: 'Vencida' };
    if(paidCount === total) return { variant: 'default', text: 'Paga' };
    if(paidCount > 0 && paidCount < total) return { variant: 'outline', text: 'Parcialmente Paga' };
    return { variant: 'secondary', text: 'Pendente' };
  }
  
  const getPaymentMethodText = (method: PaymentMethod, installments: number) => {
    const texts = {
        pix: 'PIX',
        boleto: 'Boleto',
        dinheiro: 'Dinheiro',
        cartao_credito: 'Crédito',
        cartao_debito: 'Débito'
    }
    return `${texts[method]} (${installments}x)`;
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
                {purchases.map((purchase) => {
                    const status = getOverallStatus(purchase.financialMovements);
                    return (
                        <TableRow key={purchase.id}>
                            <TableCell>{new Date(purchase.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                            <TableCell className="font-medium">{getSupplierName(purchase.supplierId)}</TableCell>
                            <TableCell>{purchase.invoiceNumber}</TableCell>
                            <TableCell>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 cursor-default">
                                            <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                            <span>{getPaymentMethodText(purchase.paymentMethod, purchase.financialMovements.length)}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Pago com {getPaymentMethodText(purchase.paymentMethod, purchase.financialMovements.length)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell className="text-right">{purchase.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={status.variant}>{status.text}</Badge>
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
                    )
                })}
            </TableBody>
            </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
