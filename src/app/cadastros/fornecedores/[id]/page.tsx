
import { SupplierDetail } from './components/supplier-detail';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import type { Supplier, Purchase, FinancialMovement } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';


async function getSupplierData(id: string) {
    const supplierDocRef = doc(db, 'suppliers', id);
    const supplierDoc = await getDoc(supplierDocRef);
    if (!supplierDoc.exists()) return null;

    const supplier = { id: supplierDoc.id, ...supplierDoc.data() } as Supplier;

    // Fetch related purchases
    const purchasesQuery = query(collection(db, 'purchases'), where('supplierId', '==', id));
    const purchasesSnapshot = await getDocs(purchasesQuery);
    const purchases = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
    const purchaseIds = purchases.map(p => p.id);
    
    // Fetch related financial movements
    let movements: FinancialMovement[] = [];
    if (purchaseIds.length > 0) {
        // Firestore 'in' query is limited to 30 items. For more, batching is needed.
        const movementsQuery = query(collection(db, 'financialMovements'), where('referenceId', 'in', purchaseIds));
        const movementsSnapshot = await getDocs(movementsQuery);
        movements = movementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialMovement));
    }


    return { supplier, purchases, movements };
}


export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const data = await getSupplierData(params.id);

  if (!data) {
    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold">Fornecedor não encontrado</h1>
             <Button asChild variant="outline">
                <Link href="/cadastros?tab=suppliers">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar para Cadastros
                </Link>
            </Button>
        </div>
    );
  }

  const { supplier, purchases, movements } = data;

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
      <SupplierDetail supplier={supplier} purchases={purchases} movements={movements} />
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const suppliersCollection = collection(db, 'suppliers');
    const suppliersSnapshot = await getDocs(suppliersCollection);
    return suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
    }));
  } catch (error) {
    console.error("Failed to generate static params for suppliers:", error);
    return [];
  }
}
