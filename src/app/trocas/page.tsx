
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ExchangeForm } from './components/exchange-form';
import { ExchangeHistory } from './components/exchange-history';


export default function TrocasPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

   useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
      } catch (error) {
        toast({
            title: "Erro ao buscar produtos",
            description: "Não foi possível carregar os produtos do banco de dados.",
            variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);


  return (
    <>
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Manuseio de Trocas">
          <Button onClick={() => setIsFormOpen(true)} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Registrar Nova Troca
          </Button>
        </PageHeader>
        <ExchangeHistory />
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
                    onExchangeRegistered={() => setIsFormOpen(false)}
                />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
