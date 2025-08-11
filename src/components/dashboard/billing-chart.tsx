
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { billingData } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';

export function BillingChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Faturamento - Últimos 7 Dias</CardTitle>
            </div>
            <div className="flex items-center text-sm text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1"/>
                <span>+15% vs. semana anterior</span>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={billingData} barGap={10} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value / 1000}k`}
              domain={[0, 'dataMax + 500']}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
               formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), "Total"]}
            />
            <Bar dataKey="total" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
         <div className="flex justify-between text-sm mt-4 pt-4 border-t">
            <div>
                <p className="text-muted-foreground">Total da Semana:</p>
                <p className="font-bold">R$ 9.507,00</p>
            </div>
            <div>
                <p className="text-muted-foreground">Média Diária:</p>
                <p className="font-bold">R$ 1.358,14</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
