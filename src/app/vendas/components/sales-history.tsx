// @ts-nocheck

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
import { ArrowRight, Loader2, ShoppingBag, Truck } from 'lucide-react';
import type { Sale } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { collection, getDocs } from '@/lib/netly';
import { useToast } from '@/hooks/use-toast';

export function SalesHistory() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const salesList = (await getDocs(collection('sales'))) as Array<Sale & { id: string }>;
                setSales(salesList.sort((a, b) => b.date.localeCompare(a.date)));
            } catch (error) {
                toast({
                    title: "Erro ao buscar histórico",
                    description: "Não foi possível carregar as vendas.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [toast]);


  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Visualize todas as vendas registradas.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </CardContent>
        </Card>
    );
  }
  
  const getChannelText = (channel: Sale['channel']) => {
      const map = {
          'interna': {text: 'Interna (Balcão)', icon: ShoppingBag},
          'externa_rota': {text: 'Externa (Rota)', icon: Truck},
          'externa_feira': {text: 'Externa (Feira)', icon: Truck},
          'externa_entrega': {text: 'Externa (Entrega)', icon: Truck},
      }
      return map[channel] || {text: 'N/A', icon: ShoppingBag};
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico Geral de Vendas</CardTitle>
        <CardDescription>Visualize todas as vendas internas e externas registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => {
              const channelInfo = getChannelText(sale.channel);
              return (
                 <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</TableCell>
                    <TableCell className="text-sm">
                        {sale.items.map((item, i) => <div key={i}>{item.quantity}x {item.productName}</div>)}
                    </TableCell>
                    <TableCell>
                        <div className='flex items-center gap-2'>
                           <channelInfo.icon className="h-4 w-4 text-muted-foreground"/>
                           <span>{channelInfo.text}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={sale.status === 'concluida' ? 'default' : 'secondary'}>
                            {sale.status === 'concluida' ? 'Concluída' : 'Pendente'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                        {sale.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                </TableRow>
              )
            })}
             {sales.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhuma venda registrada.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
