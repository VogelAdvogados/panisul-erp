
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
import { collection, getDocs, limit, query, where, orderBy } from 'firebase/firestore';
import type { FinancialMovement, Ingredient } from '@/lib/types';
import { StatCard } from '@/components/stat-card';
import { LatestTransactions } from '@/components/dashboard/latest-transactions';

async function getDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, 'yyyy-MM-dd');
    
    // To avoid complex queries, fetch movements for the day and process in code.
    const movementsRef = collection(db, 'financialMovements');
    const movementsTodayQuery = query(movementsRef, where('dueDate', '==', todayStr));
    const paidTodayQuery = query(movementsRef, where('paymentDate', '==', todayStr));

    const [
        movementsTodaySnapshot,
        paidTodaySnapshot
    ] = await Promise.all([
        getDocs(movementsTodayQuery),
        getDocs(paidTodayQuery)
    ]);
    
    const movementsToday = movementsTodaySnapshot.docs.map(doc => doc.data() as FinancialMovement);
    const paidToday = paidTodaySnapshot.docs.map(doc => doc.data() as FinancialMovement);

    const totalPayableToday = movementsToday.filter(m => m.status === 'pending' && m.type === 'expense').reduce((acc, m) => acc + m.amount, 0);
    const totalReceivableToday = movementsToday.filter(m => m.status === 'pending' && m.type === 'revenue').reduce((acc, m) => acc + m.amount, 0);
    const totalRevenueToday = paidToday.filter(m => m.type === 'revenue').reduce((acc, m) => acc + m.amount, 0);
    const totalExpenseToday = paidToday.filter(m => m.type === 'expense').reduce((acc, m) => acc + m.amount, 0);

    // Fetch low stock items
    const lowStockQuery = query(collection(db, 'ingredients'), where('stock', '<', 1000), limit(5));
    const lowStockSnapshot = await getDocs(lowStockQuery);
    const lowStockItems = lowStockSnapshot.docs.map(doc => doc.data() as Ingredient);

    // Fetch latest transactions
    const latestTransactionsQuery = query(collection(db, "financialMovements"), where('status', '==', 'paid'), orderBy("paymentDate", "desc"), limit(5));
    const latestTransactionsSnapshot = await getDocs(latestTransactionsQuery);
    const latestTransactions = latestTransactionsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as FinancialMovement);

    // Note: Cash and Bank balances would typically come from a separate 'accounts' collection
    // or be calculated based on all historical transactions. For simplicity, we use mock data here.
    const cashBalance = 1247.50;
    const bankBalance = 8456.30;

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


// Helper to format date, as it's not available in Server Components by default
import { format } from 'date-fns';

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
