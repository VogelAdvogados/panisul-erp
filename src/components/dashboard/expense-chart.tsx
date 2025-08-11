
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { expenseChartData } from '@/lib/data';
import type { ChartConfig } from '@/components/ui/chart';
import { expenseCategories } from '@/lib/categories';


const chartConfig = Object.entries(expenseCategories).reduce((acc, [key, value]) => {
    acc[key] = { label: value.label, color: value.color };
    return acc;
}, {} as ChartConfig);


export function ExpenseChart() {
    const totalValue = expenseChartData.reduce((acc, item) => acc + item.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Despesas do Mês por Categoria</CardTitle>
                <CardDescription>R$ {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', 'R$ ')} no total</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Tooltip
                             formatter={(value: number, name: string) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), chartConfig[name as keyof typeof chartConfig]?.label]}
                        />
                        <Pie
                            data={expenseChartData}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            labelLine={false}
                        >
                            {expenseChartData.map((entry) => (
                                <Cell key={entry.category} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 text-sm">
                    {expenseChartData.map((item) => (
                        <div key={item.category} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }}></span>
                                <span>{expenseCategories[item.category].label}</span>
                            </div>
                            <span className="font-medium">{item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}