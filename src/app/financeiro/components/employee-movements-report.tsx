'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FinancialMovement, Employee } from '@/lib/types';

export function EmployeeMovementsReport() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [employees, setEmployees] = useState<Record<string, string>>({});
  const [totals, setTotals] = useState<Record<string, { revenue: number; expense: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'employees'));
        const map: Record<string, string> = {};
        snapshot.docs.forEach(doc => {
          map[doc.id] = (doc.data() as Employee).name;
        });
        setEmployees(map);
      } catch (error) {
        console.error('Error fetching employees', error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchMovements = async () => {
      setIsLoading(true);
      try {
        const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const end = new Date(year, month, 0).toISOString().split('T')[0];
        const q = query(
          collection(db, 'financialMovements'),
          where('status', '==', 'paid'),
          where('paymentDate', '>=', start),
          where('paymentDate', '<=', end),
          orderBy('paymentDate', 'asc')
        );
        const snapshot = await getDocs(q);
        const map: Record<string, { revenue: number; expense: number }> = {};
        snapshot.docs.forEach(doc => {
          const m = { id: doc.id, ...doc.data() } as FinancialMovement;
          const id = m.employeeId || 'unknown';
          if (!map[id]) {
            map[id] = { revenue: 0, expense: 0 };
          }
          if (m.amount > 0) {
            map[id].revenue += m.amount;
          } else {
            map[id].expense += Math.abs(m.amount);
          }
        });
        setTotals(map);
      } catch (error) {
        toast({
          title: 'Erro ao buscar movimentações',
          description: 'Não foi possível carregar os dados.',
          variant: 'destructive'
        });
        console.error('Error fetching movements', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovements();
  }, [month, year, toast]);

  const rows = useMemo(() => {
    return Object.entries(totals).map(([id, t]) => {
      const total = t.revenue - t.expense;
      return {
        id,
        name: employees[id] || 'Não informado',
        revenue: t.revenue,
        expense: t.expense,
        total
      };
    });
  }, [totals, employees]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Movimentações por Funcionário</CardTitle>
            <CardDescription>Totais de receitas e despesas no período selecionado.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      {isLoading ? (
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      ) : (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {row.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {row.expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${row.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {row.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhuma movimentação para este período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}

