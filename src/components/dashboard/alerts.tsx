import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const alertItems = [
    {
        icon: AlertTriangle,
        iconColor: 'text-red-500 bg-red-100',
        title: 'Estoque Baixo',
        description: 'Farinha de Trigo: 2kg restantes (mín: 10kg)',
        time: '5 min atrás'
    },
    {
        icon: Clock,
        iconColor: 'text-orange-500 bg-orange-100',
        title: 'Contas a Receber',
        description: '3 contas vencidas - Total: R$ 245,00',
        time: '1 hora atrás'
    },
    {
        icon: Package,
        iconColor: 'text-blue-500 bg-blue-100',
        title: 'Estoque Mínimo',
        description: 'Fermento Biológico: 500g restantes (mín: 1kg)',
        time: '2 horas atrás'
    }
]

export function Alerts() {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Alertas e Notificações</CardTitle>
              <CardDescription>1 crítico</CardDescription>
            </div>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {alertItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${item.iconColor}`}>
                        <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                    <Button variant="link" size="sm" className="text-primary self-center">Resolver</Button>
                </div>
            ))}
          </CardContent>
        </Card>
    )
}
