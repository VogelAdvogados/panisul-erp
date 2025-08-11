
import PageHeader from '@/components/page-header';
import { SalesHistoryList } from './components/sales-history-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function VendasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Vendas">
        <Button asChild>
            <Link href="/operacoes">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Nova Venda
            </Link>
        </Button>
      </PageHeader>
      <SalesHistoryList />
    </div>
  );
}
