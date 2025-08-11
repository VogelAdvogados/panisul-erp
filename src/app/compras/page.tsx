import PageHeader from '@/components/page-header';
import { PurchaseImportForm } from './components/purchase-import-form';

export default function ComprasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Compras" />
      <PurchaseImportForm />
    </div>
  );
}
