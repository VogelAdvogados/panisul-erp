import { StatCard } from "@/components/stat-card";
import { BarChart3, Briefcase, ShoppingCart, Users, Wallet } from "lucide-react";
import PageHeader from "@/components/page-header";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { OperationalSummary } from "@/components/dashboard/operational-summary";
import { Alerts } from "@/components/dashboard/alerts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value="R$ 125.430,50"
          icon={Wallet}
          change="+12.5% vs mês anterior"
        />
        <StatCard
          title="Novos Clientes"
          value="42"
          icon={Users}
          change="+5 nesta semana"
          color="bg-accent"
        />
        <StatCard
          title="Vendas do Dia"
          value="152"
          icon={ShoppingCart}
          change="-2.1% vs ontem"
        />
        <StatCard
          title="Produtos em Baixo Estoque"
          value="8"
          icon={Briefcase}
          change="Reposição necessária"
          color="bg-destructive"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesChart />
          </CardContent>
        </Card>
        <div className="col-span-4 lg:col-span-3 flex flex-col gap-4">
          <OperationalSummary />
          <Alerts />
        </div>
      </div>
    </div>
  );
}
