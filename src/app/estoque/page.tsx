
'use client';

import PageHeader from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from './components/product-list';
import { IngredientList } from './components/ingredient-list';

export default function EstoquePage() {

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Controle de Estoque" />
      <Tabs defaultValue="products" className="w-full">
          <TabsList>
              <TabsTrigger value="products">Produtos Acabados</TabsTrigger>
              <TabsTrigger value="ingredients">Insumos (Matéria-prima)</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <ProductList />
          </TabsContent>
          <TabsContent value="ingredients">
            <IngredientList />
          </TabsContent>
      </Tabs>
    </div>
  );
}
