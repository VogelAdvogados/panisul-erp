import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Archive } from 'lucide-react';

export function Alerts() {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Importantes</CardTitle>
            <CardDescription>Ações que requerem sua atenção.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className="flex items-start space-x-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
              <Archive className="h-6 w-6 text-yellow-600 mt-1" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Estoque Baixo</p>
                <p className="text-sm text-muted-foreground">
                  Farinha de Trigo e Fermento Biológico estão abaixo do nível mínimo.
                </p>
              </div>
            </div>
             <div className="flex items-start space-x-4 rounded-md border-destructive/50 bg-destructive/10 p-4">
              <AlertCircle className="h-6 w-6 text-destructive mt-1" />
              <div className="flex-1 space-y-1">
                <p className="font-semibold">Contas Vencidas</p>
                <p className="text-sm text-muted-foreground">
                  Existem 3 contas a receber vencidas. Total: R$ 1.850,00.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    )
}
