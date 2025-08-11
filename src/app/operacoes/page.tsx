
'use client';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingCart, Package, RefreshCw, Eye, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { generateImage } from '@/ai/flows/generate-image';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RegisterProductionForm } from './components/register-production-form';
import { RegisterSaleForm } from './components/register-sale-form';

function ProductImage({ product }: { product: Product }) {
  const [imageUrl, setImageUrl] = useState(product.imageUrl);

  useEffect(() => {
    if (product.imageUrl && !product.imageUrl.startsWith('https://placehold.co')) {
      return;
    }

    let isCancelled = false;

    const generate = async () => {
      try {
        const imageDataUri = await generateImage({
          prompt: `a professional, appetizing photo of a single ${product['data-ai-hint']} on a rustic wooden bakery table, warm lighting`
        });
        if (!isCancelled) {
          setImageUrl(imageDataUri);
          // TODO: Save this URL back to Firestore
        }
      } catch (e) {
        console.error(`Failed to generate image for ${product.name}`, e);
        // Keep placeholder if generation fails
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [product]);

  return <Image src={imageUrl} alt={product.name} width={600} height={400} className="object-cover w-full h-full" data-ai-hint={product['data-ai-hint']} />;
}


export default function OperacoesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductionFormOpen, setIsProductionFormOpen] = useState(false);
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [selectedProductForSale, setSelectedProductForSale] = useState<Product | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
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
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  const handleOpenSaleForm = (product: Product) => {
    setSelectedProductForSale(product);
    setIsSaleFormOpen(true);
  }

  return (
    <>
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Painel do Dia">
          <Button onClick={() => setIsProductionFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Produção
          </Button>
        </PageHeader>
        
        <div>
          <h2 className='text-xl font-semibold'>Painel Operacional do Dia</h2>
          <p className='text-muted-foreground'>Gerencie a produção e vendas diárias</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="p-0 bg-muted/30">
                <div className="aspect-[3/2] w-full flex items-center justify-center bg-amber-50 rounded-t-lg overflow-hidden">
                  <Suspense fallback={<Skeleton className="w-full h-full" />}>
                    <ProductImage product={product} />
                  </Suspense>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-grow">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className='flex justify-between'><span>Estoque Atual:</span> <span className='font-bold text-red-500'>{product.stock} un.</span></div>
                  <div className='flex justify-between'><span>Produzido:</span> <span className='font-bold text-blue-500'>{product.produced} un.</span></div>
                  <div className='flex justify-between'><span>Vendido:</span> <span className='font-bold text-green-500'>{product.sold} un.</span></div>
                  <div className='flex justify-between'><span>Preço:</span> <span className='font-bold text-foreground'>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                <div className='flex gap-2 w-full'>
                  <Button size="sm" className="w-full bg-green-500 hover:bg-green-600" onClick={() => handleOpenSaleForm(product)} disabled={product.stock === 0}>
                      <ShoppingCart className='h-4 w-4 mr-2'/>
                      Vender
                  </Button>
                  <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                      <RefreshCw className='h-4 w-4 mr-2'/>
                      Trocar
                  </Button>
                </div>
                <Button variant="link" size="sm" className="w-full text-muted-foreground">
                  <Eye className='h-4 w-4 mr-2'/>
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-green-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-white">Total de Vendas Hoje</CardTitle>
                      <p className="text-green-100 text-sm">23 transações</p>
                  </div>
                  <div className='p-3 bg-white/20 rounded-lg'>
                      <ShoppingBag className="w-8 h-8"/>
                  </div>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">R$ 1.247,50</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-white">Produção Total Hoje</CardTitle>
                      <p className="text-blue-100 text-sm">4 produtos diferentes</p>
                  </div>
                  <div className='p-3 bg-white/20 rounded-lg'>
                      <Package className="w-8 h-8"/>
                  </div>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">179 un.</p>
              </CardContent>
            </Card>
            <Card className="bg-orange-600 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle className="text-white">Trocas Realizadas</CardTitle>
                      <p className="text-orange-100 text-sm">R$ 45,00 em custo</p>
                  </div>
                  <div className='p-3 bg-white/20 rounded-lg'>
                      <RefreshCw className="w-8 h-8"/>
                  </div>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">3</p>
              </CardContent>
            </Card>
        </div>

      </div>
      <Dialog open={isProductionFormOpen} onOpenChange={setIsProductionFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Registrar Nova Produção</DialogTitle>
                <DialogDescription>
                    Selecione o produto e a quantidade produzida. O sistema dará baixa automática nos insumos do estoque.
                </DialogDescription>
            </DialogHeader>
            <RegisterProductionForm products={products} onProductionRegistered={() => {
                fetchProducts();
                setIsProductionFormOpen(false);
            }} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSaleFormOpen} onOpenChange={setIsSaleFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
                <DialogDescription>
                    Confirme a quantidade e a forma de pagamento. O estoque e o financeiro serão atualizados automaticamente.
                </DialogDescription>
            </DialogHeader>
            {selectedProductForSale && (
                <RegisterSaleForm product={selectedProductForSale} onSaleRegistered={() => {
                    fetchProducts();
                    setIsSaleFormOpen(false);
                }} />
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
