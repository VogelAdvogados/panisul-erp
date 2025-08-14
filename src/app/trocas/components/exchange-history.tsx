
'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Exchange, Product } from '@/lib/types';

interface ExchangeHistoryProps {
    exchanges: (Exchange & { returnedProduct?: Product, newProduct?: Product })[];
    isLoading: boolean;
}

export function ExchangeHistory({ exchanges, isLoading }: ExchangeHistoryProps) {

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Trocas</CardTitle>
                <CardDescription>Visualize todas as trocas de produtos registradas.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Trocas</CardTitle>
        <CardDescription>Visualize todas as trocas de produtos registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Troca Realizada</TableHead>
              <TableHead>Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exchanges.map((exchange) => (
              <TableRow key={exchange.id}>
                <TableCell>{new Date(exchange.date).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                    <span className="text-red-600">{exchange.returnedProduct?.name || 'Produto não encontrado'}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-green-600">{exchange.newProduct?.name || 'Produto não encontrado'}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{exchange.reason}</TableCell>
              </TableRow>
            ))}
             {exchanges.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Nenhuma troca registrada.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

    