import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function TrocasPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Manuseio de Trocas">
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Nova Troca
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
            <CardTitle>Histórico de Trocas</CardTitle>
            <CardDescription>Visualize e gerencie as trocas de produtos.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Tabela de trocas em construção.</p>
        </CardContent>
      </Card>
    </div>
  );
}
