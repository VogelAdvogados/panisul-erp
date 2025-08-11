
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { expenseData } from '@/lib/data';
import type { ChartConfig } from '@/components/ui/chart';

const chartConfig = {
    value: {
      label: 'Valor',
    },
    insumos: {
      label: 'Insumos',
      color: 'hsl(var(--chart-1))',
    },
    salarios: {
      label: 'Salários',
      color: 'hsl(var(--chart-2))',
    },
    energia: {
      label: 'Energia',
      color: 'hsl(var(--chart-3))',
    },
    aluguel: {
      label: 'Aluguel',
      color: 'hsl(var(--chart-4))',
    },
    outros: {
      label: 'Outros',
      color: 'hsl(var(--chart-5))',
    },
} satisfies ChartConfig;


export function ExpenseChart() {
    const totalValue = expenseData.reduce((acc, item) => acc + item.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Despesas do Mês por Categoria</CardTitle>
                <CardDescription>R$ {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} no total</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Tooltip
                             formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), chartConfig[name as keyof typeof chartConfig]?.label]}
                        />
                        <Pie
                            data={expenseData}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            labelLine={false}
                        >
                            {expenseData.map((entry) => (
                                <Cell key={entry.category} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 text-sm">
                    {expenseData.map((item) => (
                        <div key={item.category} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}></span>
                                <span>{item.category}</span>
                            </div>
                            <span className="font-medium">{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

