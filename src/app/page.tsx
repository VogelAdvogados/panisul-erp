// @ts-nocheck

import {
  Wallet,
  Landmark,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import PageHeader from '@/components/page-header';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Alerts } from '@/components/dashboard/alerts';
import { BillingChart } from '@/components/dashboard/billing-chart';
import { ExpenseChart } from '@/components/dashboard/expense-chart';
import { collection, getDocs } from '@/lib/netly';
import type { FinancialMovement, Ingredient } from '@/lib/types';
import { StatCard } from '@/components/stat-card';
import { LatestTransactions } from '@/components/dashboard/latest-transactions';

// Helper to format date, as it's not available in Server Components by default
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';

export const revalidate = 60; // Revalidate the dashboard every 60 seconds

async function getDashboardData() {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const [movements, ingredients] = await Promise.all([
        getDocs(collection('financialMovements')) as Promise<Array<FinancialMovement & { id: string }>>,
        getDocs(collection('ingredients')) as Promise<Array<Ingredient & { id: string }>>,
    ]);

    const paidToday = movements.filter(m => m.paymentDate === todayStr && m.status === 'paid');
    const dueToday = movements.filter(m => m.dueDate === todayStr && m.status === 'pending');
    const allMovements = movements.filter(m => m.status === 'paid');

    const cashBalance = allMovements
        .filter(m => m.sourceAccount === 'cash')
        .reduce((acc, m) => acc + m.amount, 0);

    const bankBalance = allMovements
        .filter(m => m.sourceAccount === 'bank')
        .reduce((acc, m) => acc + m.amount, 0);

    const totalRevenueToday = paidToday.filter(m => m.type === 'revenue').reduce((acc, m) => acc + m.amount, 0);
    const totalExpenseToday = paidToday.filter(m => m.type === 'expense').reduce((acc, m) => acc + m.amount, 0);

    const totalPayableToday = dueToday.filter(m => m.type === 'expense').reduce((acc, m) => acc + m.amount, 0);
    const totalReceivableToday = dueToday.filter(m => m.type === 'revenue').reduce((acc, m) => acc + m.amount, 0);

    const lowStockItems = ingredients.filter(i => i.stock < 1000).slice(0, 5);
    const latestTransactions = movements
        .filter(m => m.status === 'paid')
        .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''))
        .slice(0, 5);

    return {
        cashBalance,
        bankBalance,
        totalPayableToday,
        totalReceivableToday,
        totalRevenueToday,
        totalExpenseToday,
        lowStockItems,
        latestTransactions,
    };
}


export default async function Dashboard() {
  const data = await getDashboardData();
  
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Dashboard Gerencial" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receitas do Dia"
          value={data.totalRevenueToday.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
          icon={Wallet}
          change={Math.abs(data.totalExpenseToday).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) + " em despesas"}
        />
        <StatCard
          title="Saldo em Contas"
          value={(data.bankBalance + data.cashBalance).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
          icon={Landmark}
           change={`Caixa: ${data.cashBalance.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}`}
        />
        <StatCard
          title="Contas a Receber (Hoje)"
          value={data.totalReceivableToday.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
          icon={Clock}
          change={`${data.lowStockItems.length} alertas de estoque`}
        />
        <StatCard
          title="Contas a Pagar (Hoje)"
          value={Math.abs(data.totalPayableToday).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
          icon={AlertOctagon}
          change="Vencendo hoje"
          iconColor="text-destructive"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <BillingChart />
           <LatestTransactions transactions={data.latestTransactions} />
        </div>
        <div className="space-y-6">
          <Alerts lowStockItems={data.lowStockItems} />
          <ExpenseChart />
        </div>
      </div>
    </div>
  );
}
