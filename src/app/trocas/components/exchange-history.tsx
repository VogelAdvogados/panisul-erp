
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
import { ArrowRight } from 'lucide-react';

// Mock data until we have a real exchange history in Firestore
const mockExchanges = [
    { id: 'EXC-001', date: '2024-05-20', returnedProduct: 'Croissant', newProduct: 'Sonho', reason: 'Cliente preferiu outro doce.' },
    { id: 'EXC-002', date: '2024-05-18', returnedProduct: 'Pão Francês', newProduct: 'Pão Francês', reason: 'Produto amassado na embalagem.' },
];


export function ExchangeHistory() {
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
            {mockExchanges.map((exchange) => (
              <TableRow key={exchange.id}>
                <TableCell>{exchange.date}</TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                    <span className="text-red-600">{exchange.returnedProduct}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-green-600">{exchange.newProduct}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{exchange.reason}</TableCell>
              </TableRow>
            ))}
             {mockExchanges.length === 0 && (
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
