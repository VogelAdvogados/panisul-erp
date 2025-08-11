
import { SupplierDetail } from './components/supplier-detail';
import { suppliers, purchases } from '@/lib/data';
import type { Supplier } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';


export default function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supplier = suppliers.find(s => s.id === params.id);
  const supplierPurchases = purchases.filter(p => p.supplierId === params.id);

  if (!supplier) {
    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold">Fornecedor não encontrado</h1>
             <Button asChild variant="outline">
                <Link href="/cadastros">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar para Cadastros
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
       <div className='flex items-center gap-4'>
            <Button asChild variant="outline" size="icon">
                <Link href="/cadastros?tab=suppliers">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
                    Ficha do Fornecedor
                </h1>
                <p className='text-muted-foreground'>Visualize o histórico completo do fornecedor.</p>
            </div>
       </div>
      <SupplierDetail supplier={supplier} purchases={supplierPurchases} />
    </div>
  );
}

export async function generateStaticParams() {
  return suppliers.map(supplier => ({
    id: supplier.id,
  }));
}
