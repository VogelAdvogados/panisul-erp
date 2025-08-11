import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownUp, PlusCircle } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Financeiro">
        <Button variant="outline">
          <ArrowDownUp className="mr-2 h-4 w-4" />
          Nova Transferência
        </Button>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Lançamento
        </Button>
      </PageHeader>
      <Tabs defaultValue="overview">
          <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
              <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
              <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
                <CardHeader>
                    <CardTitle>Visão Geral Financeira</CardTitle>
                    <CardDescription>Resumo das suas contas e saldos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Gráficos e saldos das contas (Caixa Físico, Conta Corrente) aqui...</p>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payable">
            <Card>
                <CardHeader>
                    <CardTitle>Contas a Pagar</CardTitle>
                    <CardDescription>Gerencie suas despesas e pagamentos pendentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Tabela de contas a pagar aqui...</p>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="receivable">
            <Card>
                <CardHeader>
                    <CardTitle>Contas a Receber</CardTitle>
                    <CardDescription>Acompanhe seus recebimentos e clientes devedores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Tabela de contas a receber aqui...</p>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cashflow">
            <Card>
                <CardHeader>
                    <CardTitle>Fluxo de Caixa</CardTitle>
                    <CardDescription>Visualize o fluxo de entradas e saídas por conta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Relatório de fluxo de caixa aqui...</p>
                </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
