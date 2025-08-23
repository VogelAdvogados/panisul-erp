'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { SupplierList } from './components/supplier-list';
import { RecipeList } from './components/recipe-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from './components/product-list';
import { IngredientList } from './components/ingredient-list';
import { SalespersonList } from './components/salesperson-list';
import { EmployeeList } from './components/employee-list';

function CadastrosContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'products';

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Cadastros" />
      <Tabs defaultValue={tab} className="w-full">
        <TabsList>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="ingredients">Insumos</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="salespeople">Vendedores</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
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
        <TabsContent value="salespeople">
          <SalespersonList />
        </TabsContent>
        <TabsContent value="employees">
          <EmployeeList />
        </TabsContent>
        <TabsContent value="recipes">
          <RecipeList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CadastrosPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CadastrosContent />
    </Suspense>
  );
}
