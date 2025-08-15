

'use client';

import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/page-header';
import { SupplierList } from './components/supplier-list';
import { RecipeList } from './components/recipe-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function CadastrosPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'suppliers';

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Configurações" />
      <Tabs defaultValue={tab} className="w-full">
          <TabsList>
              <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
              <TabsTrigger value="recipes">Fichas Técnicas</TabsTrigger>
          </TabsList>
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
