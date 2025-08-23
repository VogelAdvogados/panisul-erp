// @ts-nocheck

'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Product, Exchange, Customer } from '@/lib/types';
import { db, collection, getDocs, orderBy, query } from '@/lib/netly';
import { ExchangeForm } from './components/exchange-form';
import { ExchangeHistory } from './components/exchange-history';


export default function TrocasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [exchanges, setExchanges] = useState<(Exchange & { returnedProduct?: Product, newProduct?: Product })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

   const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const exchangesQuery = query(collection(db, 'exchanges'), orderBy('date', 'desc'));

      const [productsSnapshot, exchangesSnapshot, customersSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(exchangesQuery),
        getDocs(collection(db, 'customers')),
      ]);
      
      const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const productsMap = new Map(productList.map(p => [p.id, p]));
      
      const exchangeList = exchangesSnapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as Exchange;
        return {
          ...data,
          returnedProduct: productsMap.get(data.returnedProductId),
          newProduct: productsMap.get(data.newProductId),
        }
      });
      
      const customerList = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));

      setProducts(productList);
      setCustomers(customerList);
      setExchanges(exchangeList);

    } catch (error) {
      toast({
          title: "Erro ao buscar dados",
          description: "Não foi possível carregar os dados de trocas e produtos.",
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
        <PageHeader title="Manuseio de Trocas">
          <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Registrar Nova Troca
          </Button>
        </PageHeader>
        <ExchangeHistory exchanges={exchanges} isLoading={isLoading} />
      </div>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Registrar Nova Troca</DialogTitle>
                <DialogDescription>
                    Selecione os produtos envolvidos na troca e o motivo. O estoque será ajustado automaticamente.
                </DialogDescription>
            </DialogHeader>
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <ExchangeForm 
                    products={products}
                    customers={customers} 
                    onExchangeRegistered={() => {
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
