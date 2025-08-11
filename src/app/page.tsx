import { StatCard } from '@/components/stat-card';
import {
  Wallet,
  Landmark,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import PageHeader from '@/components/page-header';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { OperationalSummary } from '@/components/dashboard/operational-summary';
import { Alerts } from '@/components/dashboard/alerts';
import { BillingChart } from '@/components/dashboard/billing-chart';
import { ExpenseChart } from '@/components/dashboard/expense-chart';

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Dashboard Gerencial" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Saldo em Caixa (Espécie)"
          value="R$ 1.247,50"
          icon={Wallet}
          change="+ R$ 180,00 vs. ontem"
          changeColor="text-green-500"
        />
        <StatCard
          title="Saldo Conta Corrente"
          value="R$ 8.456,30"
          icon={Landmark}
          change="+ R$ 1.200,00 vs. ontem"
          changeColor="text-green-500"
        />
        <StatCard
          title="Contas a Receber (Hoje)"
          value="R$ 245,00"
          icon={Clock}
          change="3 contas vs. ontem"
        />
        <StatCard
          title="Contas a Pagar (Hoje)"
          value="R$ 180,00"
          icon={AlertOctagon}
          change="1 conta vs. ontem"
          iconColor="text-destructive"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <BillingChart />
        </div>
        <div className="space-y-6">
          <OperationalSummary />
          <Alerts />
          <ExpenseChart />
        </div>
      </div>
    </div>
  );
}
