
'use client';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, CalendarDays } from 'lucide-react';
import { FinancialAnalysis } from './components/financial-analysis';
import { AccountsPayable } from './components/accounts-payable';
import { AccountsReceivable } from './components/accounts-receivable';
import { TransactionsList } from './components/transactions-list';
import { LatestTransactions } from './components/latest-transactions';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FinanceiroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'overview';
  const accountFilter = searchParams.get('account');


  const handleTabChange = (tab: string) => {
    router.push(`/financeiro?tab=${tab}`);
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">Gestão Financeira</h1>
          <p className="text-sm text-muted-foreground">Controle completo das finanças da padaria</p>
        </div>
        <div className="flex items-center space-x-2">
            <Select defaultValue="today">
                <SelectTrigger className="w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="this_week">Esta Semana</SelectItem>
                    <SelectItem value="this_month">Este Mês</SelectItem>
                </SelectContent>
            </Select>
            <Button asChild>
                <Link href="/financeiro/despesas/nova">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Despesa
                </Link>
            </Button>
        </div>
      </div>
      <Tabs value={defaultTab} onValueChange={handleTabChange}>
          <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
              <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
              <TabsTrigger value="movements">Movimentações</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Link href="/financeiro?tab=movements&account=cash" className="block hover:shadow-lg transition-shadow rounded-lg">
                    <Card className='shadow-md h-full'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <div className='flex items-center gap-4'>
                                <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                                    <Wallet className='h-6 w-6' />
                                </div>
                                <div>
                                    <CardTitle className='text-lg font-medium'>Caixa Físico</CardTitle>
                                    <p className='text-xs text-muted-foreground'>23 transações hoje</p>
                                </div>
                            </div>
                            <div className='text-2xl font-bold text-right'>R$ 1.247,50</div>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/financeiro?tab=movements&account=bank" className="block hover:shadow-lg transition-shadow rounded-lg">
                    <Card className='shadow-md h-full'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <div className='flex items-center gap-4'>
                                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                                    <CreditCard className='h-6 w-6' />
                                </div>
                                <div>
                                    <CardTitle className='text-lg font-medium'>Conta Corrente</CardTitle>
                                    <p className='text-xs text-muted-foreground'>15 transações hoje</p>
                                </div>
                            </div>
                            <div className='text-2xl font-bold text-right'>R$ 8.456,30</div>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                <Card className='bg-green-50 border-green-200'>
                    <CardHeader>
                        <div className='flex items-center gap-2 text-green-700'>
                            <ArrowUpRight className='h-4 w-4'/>
                            <span className='font-semibold'>Receitas Hoje</span>
                        </div>
                        <div className='text-2xl font-bold text-green-800 pt-2'>R$ 1.247,50</div>
                    </CardHeader>
                </Card>
                 <Card className='bg-red-50 border-red-200'>
                    <CardHeader>
                        <div className='flex items-center gap-2 text-red-700'>
                            <ArrowDownLeft className='h-4 w-4'/>
                            <span className='font-semibold'>Despesas Hoje</span>
                        </div>
                        <div className='text-2xl font-bold text-red-800 pt-2'>R$ 380,00</div>
                    </CardHeader>
                </Card>
                 <Card className='bg-orange-50 border-orange-200'>
                    <CardHeader>
                        <div className='flex items-center gap-2 text-orange-700'>
                            <Clock className='h-4 w-4'/>
                            <span className='font-semibold'>A Receber Hoje</span>
                        </div>
                        <div className='text-2xl font-bold text-orange-800 pt-2'>R$ 245,00</div>
                    </CardHeader>
                </Card>
                 <Card className='bg-blue-50 border-blue-200'>
                    <CardHeader>
                        <div className='flex items-center gap-2 text-blue-700'>
                            <CalendarDays className='h-4 w-4'/>
                            <span className='font-semibold'>A Pagar Hoje</span>
                        </div>
                        <div className='text-2xl font-bold text-blue-800 pt-2'>R$ 450,00</div>
                    </CardHeader>
                </Card>
            </div>
            <FinancialAnalysis />
            <LatestTransactions />
          </TabsContent>
          <TabsContent value="payable">
            <AccountsPayable />
          </TabsContent>
          <TabsContent value="receivable">
            <AccountsReceivable />
          </TabsContent>
          <TabsContent value="movements">
            <TransactionsList accountFilter={accountFilter} />
          </TabsContent>
      </Tabs>
    </div>
  );
}
