
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
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { FinancialMovement, Ingredient } from '@/lib/types';
import { StatCard } from '@/components/stat-card';
import { LatestTransactions } from '@/components/dashboard/latest-transactions';

// Helper to format date, as it's not available in Server Components by default
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';

async function getDashboardData() {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    // Fetch all movements that are potentially relevant for today.
    // This is more efficient than multiple complex queries that require indexes.
    const movementsRef = collection(db, 'financialMovements');
    const recentMovementsQuery = query(
        movementsRef,
        where('dueDate', '>=', format(startOfToday, 'yyyy-MM-dd')),
        orderBy('dueDate', 'asc')
    );

    const [
        allMovementsSnapshot,
        lowStockSnapshot,
        latestTransactionsSnapshot,
    ] = await Promise.all([
        getDocs(movementsRef), // Get all movements to calculate balances correctly
        getDocs(query(collection(db, 'ingredients'), where('stock', '<', 1000), limit(5))),
        getDocs(query(collection(db, "financialMovements"), where('status', '==', 'paid'), orderBy("paymentDate", "desc"), limit(5)))
    ]);
    
    const allMovements = allMovementsSnapshot.docs.map(doc => doc.data() as FinancialMovement);

    // Process data in application code - this is more flexible and avoids complex indexes
    const paidToday = allMovements.filter(m => m.paymentDate && isSameDay(new Date(m.paymentDate), today));
    const dueToday = allMovements.filter(m => m.dueDate && isSameDay(new Date(m.dueDate), today));
    
    const cashBalance = allMovements
        .filter(m => m.sourceAccount === 'cash' && m.status === 'paid')
        .reduce((acc, m) => acc + m.amount, 0);

    const bankBalance = allMovements
        .filter(m => m.sourceAccount === 'bank' && m.status === 'paid')
        .reduce((acc, m) => acc + m.amount, 0);

    const totalRevenueToday = paidToday.filter(m => m.type === 'revenue').reduce((acc, m) => acc + m.amount, 0);
    const totalExpenseToday = paidToday.filter(m => m.type === 'expense').reduce((acc, m) => acc + m.amount, 0);

    const totalPayableToday = dueToday.filter(m => m.status === 'pending' && m.type === 'expense').reduce((acc, m) => acc + m.amount, 0);
    const totalReceivableToday = dueToday.filter(m => m.status === 'pending' && m.type === 'revenue').reduce((acc, m) => acc + m.amount, 0);
    
    const lowStockItems = lowStockSnapshot.docs.map(doc => doc.data() as Ingredient);
    const latestTransactions = latestTransactionsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as FinancialMovement);

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
