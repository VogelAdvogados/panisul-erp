import PageHeader from '@/components/page-header';
import { PurchaseImportForm } from './components/purchase-import-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PurchaseHistoryList } from './components/purchase-history-list';

export default function ComprasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Gestão de Compras" />
      <Tabs defaultValue="import">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Importação Inteligente</TabsTrigger>
            <TabsTrigger value="history">Histórico de Compras</TabsTrigger>
        </TabsList>
        <TabsContent value="import" className="mt-6">
            <PurchaseImportForm />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
            <PurchaseHistoryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
