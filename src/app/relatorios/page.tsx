import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Repeat, Wallet, AreaChart } from 'lucide-react';
import Link from 'next/link';

const reports = [
    { title: "Relatório de Vendas", description: "Análise de vendas por período, cliente ou produto.", icon: BarChart3, href: "/relatorios/vendas" },
    { title: "Ranking de Clientes", description: "Liste os clientes que mais compram.", icon: Users, href: "/relatorios/ranking-clientes" },
    { title: "Análise de Trocas", description: "Visualize os motivos e custos das trocas.", icon: Repeat, href: "/relatorios/trocas" },
    { title: "Contas a Pagar/Receber", description: "Relatório detalhado de contas pendentes e pagas.", icon: Wallet, href: "/relatorios/contas" },
    { title: "Fluxo de Caixa", description: "Detalhes do fluxo de caixa por conta financeira.", icon: AreaChart, href: "/relatorios/fluxo-caixa" },
]

export default function RelatoriosPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Central de Relatórios" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report, index) => (
            <Link href={report.href} key={index} legacyBehavior>
                <a className="block">
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className='flex flex-row items-center gap-4 space-y-0'>
                            <div className='p-3 rounded-full bg-primary/10 text-primary'>
                                <report.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle>{report.title}</CardTitle>
                                <CardDescription>{report.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </a>
            </Link>
        ))}
      </div>
    </div>
  );
}
