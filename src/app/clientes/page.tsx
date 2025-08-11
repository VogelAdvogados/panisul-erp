import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function ClientesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Clientes">
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Cliente
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>Visualize e gerencie seus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Tabela de clientes em construção.</p>
        </CardContent>
      </Card>
    </div>
  );
}
