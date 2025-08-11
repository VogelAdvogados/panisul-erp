import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { SupplierList } from './components/supplier-list';
import { ProductList } from './components/product-list';
import { RecipeList } from './components/recipe-list';
import { IngredientList } from './components/ingredient-list';

export default function CadastrosPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Cadastros Base">
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Novo
        </Button>
      </PageHeader>
      <Tabs defaultValue="products">
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
