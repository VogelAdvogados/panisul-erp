import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { operationalSummaryData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

export function OperationalSummary() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resumo Operacional do Dia</CardTitle>
        <Button variant="ghost" size="sm">Atualizado agora</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            {operationalSummaryData.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-bold text-lg">{item.value}</p>
                    </div>
                  </div>
                  <div className="text-sm text-green-500 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    {item.change}
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
