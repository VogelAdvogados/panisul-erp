
'use client';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingCart, Package, RefreshCw, Eye, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { db, collection, getDocs, orderBy, query } from '@/lib/netly';
import type { Product, Customer, Ingredient } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RegisterProductionForm } from './components/register-production-form';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockAdjustmentForm } from './components/stock-adjustment-form';

export default function OperacoesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isProductionFormOpen, setIsProductionFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
        const [productsSnapshot, ingredientsSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'products'), orderBy('name'))),
            getDocs(query(collection(db, 'ingredients'), orderBy('name')))
        ]);
        const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);

        const ingredientList = ingredientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
        setIngredients(ingredientList);

    } catch (error) {
        toast({
            title: "Erro ao buscar dados",
            description: "Não foi possível carregar os produtos do banco de dados.",
            variant: "destructive"
        });
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  

  const handleFormSuccess = () => {
    fetchData();
    setIsProductionFormOpen(false);
  }

  return (
    <>
      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader title="Painel de Operações">
            <div className='flex items-center gap-2'>
                <Button onClick={() => setIsProductionFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Registrar Produção
                </Button>
                 <Button asChild>
                    <Link href="/pdv">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Ir para o Ponto de Venda
                    </Link>
                </Button>
            </div>
        </PageHeader>
        
        <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Visão Geral do Dia</TabsTrigger>
                <TabsTrigger value="stock-adjustment">Ajuste de Estoque</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <Card key={product.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="p-0 bg-muted/30">
                        <div className="aspect-[3/2] w-full flex items-center justify-center bg-amber-50 rounded-t-lg overflow-hidden">
                        <Package className="h-16 w-16 text-amber-200" />
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
                            <Button size="sm" className="w-full bg-green-500 hover:bg-green-600" asChild>
                                <Link href="/pdv">
                                    <ShoppingCart className='h-4 w-4 mr-2'/>
                                    Vender
                                </Link>
                        </Button>
                        <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                                <Link href="/trocas">
                                    <RefreshCw className='h-4 w-4 mr-2'/>
                                    Trocar
                                </Link>
                        </Button>
                        </div>
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
            </TabsContent>
            <TabsContent value="stock-adjustment" className="mt-6">
                <StockAdjustmentForm products={products} ingredients={ingredients} onAdjustmentDone={fetchData} />
            </TabsContent>
        </Tabs>

      </div>
      <Dialog open={isProductionFormOpen} onOpenChange={setIsProductionFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Registrar Nova Produção</DialogTitle>
                <DialogDescription>
                    Selecione o produto e a quantidade produzida. O sistema dará baixa automática nos insumos do estoque.
                </DialogDescription>
            </DialogHeader>
            <RegisterProductionForm products={products} onProductionRegistered={handleFormSuccess} />
        </DialogContent>
      </Dialog>
      
    </>
  );
}
