import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { operationalSummaryData } from '@/lib/data';

export function OperationalSummary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Operacional</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operationalSummaryData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.customer}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.type === 'Venda' ? 'default' : 'secondary'}>{item.type}</Badge>
                </TableCell>
                <TableCell className="text-right">{item.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
