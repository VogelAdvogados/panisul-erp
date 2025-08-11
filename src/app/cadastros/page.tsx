
'use client';

import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { SupplierList } from './components/supplier-list';
import { ProductList } from './components/product-list';
import { RecipeList } from './components/recipe-list';
import { IngredientList } from './components/ingredient-list';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function CadastrosPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'products';

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Cadastros Base" />
      <Tabs defaultValue={tab} className="w-full">
          <TabsList>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="ingredients">Insumos</TabsTrigger>
              <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
              <TabsTrigger value="recipes">Fichas Técnicas</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ProductList />
          </TabsContent>
          <TabsContent value="ingredients">
            <IngredientList />
          </TabsContent>
           <TabsContent value="suppliers">
            <SupplierList />
          </TabsContent>
          <TabsContent value="recipes">
            <RecipeList />
          </TabsContent>
      </Tabs>
    </div>
  );
}
