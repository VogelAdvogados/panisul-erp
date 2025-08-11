import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Ingredient } from '@/lib/types';
import Link from 'next/link';

interface AlertsProps {
    lowStockItems: Ingredient[];
}

export function Alerts({ lowStockItems }: AlertsProps) {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alertas e Notificações</CardTitle>
              <CardDescription>{lowStockItems.length} alertas de estoque baixo</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/cadastros?tab=ingredients">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {lowStockItems.length === 0 && (
                <div className='text-center text-muted-foreground py-4'>
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum alerta de estoque no momento.</p>
                </div>
            )}
            {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                    <div className={'p-2 rounded-full text-red-500 bg-red-100'}>
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">Estoque Baixo: {item.name}</p>
                        <p className="text-sm text-muted-foreground">
                            Estoque atual: {item.stock}{item.unitOfMeasure}
                        </p>
                    </div>
                    <Button variant="link" size="sm" className="text-primary self-center" asChild>
                        <Link href="/compras">Comprar</Link>
                    </Button>
                </div>
            ))}
          </CardContent>
        </Card>
    )
}
