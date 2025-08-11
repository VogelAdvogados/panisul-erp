
'use client';

import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { SupplierList } from './components/supplier-list';
import { ProductList } from './components/product-list';
import { RecipeList } from './components/recipe-list';
import { IngredientList } from './components/ingredient-list';

type CadastrosTab = 'products' | 'ingredients' | 'suppliers' | 'recipes';

export default function CadastrosPage() {
  const [activeTab, setActiveTab] = useState<CadastrosTab>('products');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddNew = () => {
    // This is a simplified way to trigger the form in the child component.
    // In a real app, you might use a more robust state management solution.
    if (activeTab === 'products') {
      // We will control the form state within the ProductList component itself
      // This is just a conceptual placeholder for more complex state management
    }
    // Logic for other tabs can be added here
  };


  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Cadastros Base">
        {/* The add button will be moved inside each component for better context */}
      </PageHeader>
      <Tabs defaultValue="products" onValueChange={(value) => setActiveTab(value as CadastrosTab)}>
          <TabsList>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="ingredients">Insumos</TabsTrigger>
              <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
              <TabsTrigger value="recipes">Fichas Técnicas</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <Card>
                <CardHeader>
                    <CardTitle>Produtos</CardTitle>
                    <CardDescription>Gerencie seus produtos acabados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductList />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ingredients">
            <Card>
                <CardHeader>
                    <CardTitle>Insumos</CardTitle>
                    <CardDescription>Gerencie suas matérias-primas e outros insumos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <IngredientList />
                </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="suppliers">
            <Card>
                <CardHeader>
                    <CardTitle>Fornecedores</CardTitle>
                    <CardDescription>Gerencie os fornecedores dos seus insumos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SupplierList />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recipes">
            <Card>
                <CardHeader>
                    <CardTitle>Fichas Técnicas</CardTitle>
                    <CardDescription>Gerencie as receitas dos seus produtos para cálculo de custo e baixa automática de estoque.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RecipeList />
                </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
    </div>
  );
}
