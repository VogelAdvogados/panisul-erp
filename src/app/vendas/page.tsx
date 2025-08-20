
'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Product, Customer, Salesperson } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { ExternalSaleForm } from './components/external-sale-form';
import { SalesHistory } from './components/sales-history';


export default function VendasExternasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

   const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsSnapshot, customersSnapshot, salespeopleSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'customers')),
        getDocs(collection(db, 'salespeople')),
      ]);
      
      const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const customerList = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      const salespersonList = salespeopleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Salesperson));
      
      setProducts(productList);
      setCustomers(customerList);
      setSalespeople(salespersonList);

    } catch (error) {
      toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar os dados necessários para o registro de vendas.",
          variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <>
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Gestão de Vendas Externas">
          <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Registrar Venda Externa
          </Button>
        </PageHeader>
        <SalesHistory />
      </div>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Registrar Nova Venda Externa</DialogTitle>
                <DialogDescription>
                    Preencha os detalhes da venda, incluindo cliente, produtos, canal e vendedor.
                </DialogDescription>
            </DialogHeader>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <ExternalSaleForm 
                    products={products}
                    customers={customers} 
                    salespeople={salespeople}
                    onSaleRegistered={() => {
                        setIsFormOpen(false);
                        fetchData();
                    }}
                />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
