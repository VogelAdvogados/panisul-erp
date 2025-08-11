
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Edit, Trash2, Eye, Loader2, PlusCircle } from 'lucide-react';
import type { Supplier } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
      setIsLoading(true);
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
  
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenForm = (supplier: Supplier | null) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingSupplier(null);
    setIsFormOpen(false);
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "suppliers", id));
        setSuppliers(suppliers.filter(s => s.id !== id));
        toast({ title: "Fornecedor Excluído!", description: "O fornecedor foi removido com sucesso." });
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível excluir o fornecedor.", variant: "destructive" });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supplierData = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      contact: formData.get('contact') as string,
    };

    try {
        if (editingSupplier) {
          const supplierDoc = doc(db, "suppliers", editingSupplier.id);
          await updateDoc(supplierDoc, supplierData);
          setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...s, ...supplierData } : s));
          toast({ title: "Fornecedor Atualizado!", description: "Os dados do fornecedor foram atualizados." });
        } else {
          const docRef = await addDoc(collection(db, "suppliers"), supplierData);
          setSuppliers([{ id: docRef.id, ...supplierData }, ...suppliers]);
          toast({ title: "Fornecedor Criado!", description: "Um novo fornecedor foi adicionado." });
        }
    } catch(error) {
         toast({ title: "Erro!", description: "Ocorreu um erro ao salvar o fornecedor.", variant: 'destructive' });
    } finally {
        handleCloseForm();
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Fornecedores</CardTitle>
                <CardDescription>Gerencie os fornecedores dos seus insumos.</CardDescription>
            </div>
            <Button onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Fornecedor
            </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.cnpj}</TableCell>
                    <TableCell>{supplier.contact}</TableCell>
                    <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                              <Link href={`/cadastros/fornecedores/${supplier.id}`} className="flex items-center w-full">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver Detalhes
                              </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenForm(supplier)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          </DropdownMenuContent>
                      </DropdownMenu>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso excluirá permanentemente o fornecedor.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(supplier.id)}>
                              Sim, Excluir
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
      </CardContent>
    </Card>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" name="name" defaultValue={editingSupplier?.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cnpj" className="text-right">CNPJ</Label>
                        <Input id="cnpj" name="cnpj" defaultValue={editingSupplier?.cnpj} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="contact" className="text-right">Contato</Label>
                        <Input id="contact" name="contact" defaultValue={editingSupplier?.contact} className="col-span-3" required />
                    </div>
                </div>
                    <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleCloseForm}>Cancelar</Button>
                    <Button type="submit">{editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
