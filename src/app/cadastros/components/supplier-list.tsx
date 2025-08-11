
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
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
import { MoreHorizontal, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import type { Supplier } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuppliers = async () => {
        try {
            const suppliersCollection = collection(db, 'suppliers');
            const suppliersSnapshot = await getDocs(suppliersCollection);
            const suppliersList = suppliersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
            setSuppliers(suppliersList);
        } catch (error) {
             toast({
                title: "Erro ao buscar fornecedores",
                description: "Não foi possível carregar os fornecedores do banco de dados.",
                variant: "destructive"
            });
            console.error("Error fetching suppliers: ", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchSuppliers();
  }, [toast]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }


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
                <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                        <Link href={`/cadastros/fornecedores/${supplier.id}`} className="block w-full h-full hover:underline">
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
                 {suppliers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            Nenhum fornecedor encontrado.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}

    