
'use client';

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { suppliers as initialSuppliers } from '@/lib/data';
import type { Supplier } from '@/lib/types';
import Link from 'next/link';

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Input placeholder="Buscar por nome ou CNPJ..." className="max-w-sm" />
        </div>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {suppliers.map((supplier) => (
                <TableRow key={supplier.id} className="cursor-pointer hover:bg-muted/20">
                    <TableCell className="font-medium">
                        <Link href={`/cadastros/fornecedores/${supplier.id}`} className="block w-full h-full">
                            {supplier.name}
                        </Link>
                    </TableCell>
                    <TableCell>
                         <Link href={`/cadastros/fornecedores/${supplier.id}`} className="block w-full h-full">
                            {supplier.cnpj}
                        </Link>
                    </TableCell>
                    <TableCell>
                         <Link href={`/cadastros/fornecedores/${supplier.id}`} className="block w-full h-full">
                            {supplier.contact}
                        </Link>
                    </TableCell>
                    <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Link href={`/cadastros/fornecedores/${supplier.id}`} className="flex items-center w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}
