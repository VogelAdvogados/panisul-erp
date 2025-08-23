// @ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, db } from '@/lib/netly';
import type { FinancialMovement, Employee } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface Summary {
  revenue: number;
  expense: number;
}

export function EmployeeFinancialReport() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<Record<string, Summary>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const snap = (await getDocs(collection(db, 'employees'))) as Array<Employee & { id: string }>;
      setEmployees(snap);
    };
    fetchEmployees();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const movements = ((await getDocs(collection(db, 'financialMovements'))) as Array<FinancialMovement & { id: string }>)
        .filter(
          m =>
            !!m.paymentDate &&
            m.paymentDate >= startDate &&
            m.paymentDate <= endDate &&
            m.status === 'paid' &&
            m.employeeId,
        );

      const grouped = movements.reduce<Record<string, Summary>>((acc, mov) => {
        const id = mov.employeeId as string;
        const current = acc[id] || { revenue: 0, expense: 0 };
        if (mov.amount >= 0) {
          current.revenue += mov.amount;
        } else {
          current.expense += Math.abs(mov.amount);
        }
        acc[id] = current;
        return acc;
      }, {} as Record<string, Summary>);

      setSummary(grouped);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Totais por Funcionário</CardTitle>
        <CardDescription>
          Visualize receitas e despesas vinculadas a cada funcionário no período selecionado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <Button onClick={fetchReport} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Filtrar
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(summary).map(([empId, sums]) => {
                const name = employees.find(e => e.id === empId)?.name || empId;
                const balance = sums.revenue - sums.expense;
                return (
                  <TableRow key={empId}>
                    <TableCell>{name}</TableCell>
                    <TableCell className="text-right text-green-600">
                      {sums.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {sums.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                  </TableRow>
                );
              })}
              {Object.keys(summary).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Nenhuma movimentação encontrada para o período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

