import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, History } from 'lucide-react';
import { products } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function OperacoesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Operações Diárias">
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          Histórico de Produção
        </Button>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Produção
        </Button>
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="p-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={600}
                height={400}
                className="rounded-t-lg object-cover aspect-[3/2]"
                data-ai-hint={product['data-ai-hint']}
              />
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="mt-2 text-sm text-muted-foreground">
                Estoque: <span className="font-bold text-foreground">{product.stock}</span> unidades
              </div>
              <Progress value={(product.stock / 300) * 100} className="mt-2 h-2" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button size="sm" className="w-full">
                Ver Detalhes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
