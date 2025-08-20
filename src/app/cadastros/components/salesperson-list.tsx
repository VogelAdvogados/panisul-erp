
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Edit, Trash2, Truck, Loader2, PlusCircle } from 'lucide-react';
import type { Salesperson } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

export function SalespersonList() {
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);
  const { toast } = useToast();

  const fetchSalespeople = useCallback(async () => {
    setIsLoading(true);
    try {
      const salespeopleCollection = collection(db, 'salespeople');
      const snapshot = await getDocs(salespeopleCollection);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Salesperson));
      setSalespeople(list);
    } catch (error) {
      toast({
          title: "Erro ao buscar vendedores",
          description: "Não foi possível carregar os vendedores do banco de dados.",
          variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSalespeople();
  }, [fetchSalespeople]);

  const handleOpenForm = (salesperson: Salesperson | null) => {
    setEditingSalesperson(salesperson);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingSalesperson(null);
    setIsFormOpen(false);
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "salespeople", id));
        await fetchSalespeople();
        toast({ title: "Vendedor Excluído!", description: "O vendedor foi removido com sucesso." });
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível excluir o vendedor.", variant: "destructive" });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const salespersonData: Omit<Salesperson, 'id' | 'admissionDate'> & { admissionDate: string } = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as 'ativo' | 'inativo',
      admissionDate: editingSalesperson?.admissionDate || format(new Date(), 'yyyy-MM-dd'),
    };

    try {
        if (editingSalesperson) {
          const salespersonDoc = doc(db, "salespeople", editingSalesperson.id);
          await updateDoc(salespersonDoc, salespersonData);
          toast({ title: "Vendedor Atualizado!", description: "Os dados foram atualizados." });
        } else {
          await addDoc(collection(db, "salespeople"), salespersonData);
          toast({ title: "Vendedor Criado!", description: "Um novo vendedor foi adicionado." });
        }
        await fetchSalespeople();
    } catch(error) {
         toast({ title: "Erro!", description: "Ocorreu um erro ao salvar o vendedor.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
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
                    <CardTitle>Vendedores</CardTitle>
                    <CardDescription>Gerencie sua equipe de vendas externas.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Vendedor
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Data de Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {salespeople.map((person) => (
                    <TableRow key={person.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>{person.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{person.phone} / {person.email}</TableCell>
                        <TableCell>{new Date(person.admissionDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                        <TableCell>
                            <Badge variant={person.status === 'ativo' ? 'default' : 'destructive'}>{person.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(person)}>
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
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o vendedor.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(person.id)}>
                                    Sim, Excluir
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                    {salespeople.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Nenhum vendedor encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if(isSubmitting) e.preventDefault()}} onEscapeKeyDown={(e) => { if(isSubmitting) e.preventDefault()}}>
            <DialogHeader>
                <DialogTitle>{editingSalesperson ? 'Editar Vendedor' : 'Adicionar Novo Vendedor'}</DialogTitle>
                <DialogDescription>
                    {editingSalesperson ? 'Altere os dados do vendedor.' : 'Preencha os dados para cadastrar um novo vendedor.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" name="name" defaultValue={editingSalesperson?.name} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Telefone</Label>
                        <Input id="phone" name="phone" defaultValue={editingSalesperson?.phone} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={editingSalesperson?.email} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue={editingSalesperson?.status || 'ativo'}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativo">Ativo</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                    <DialogFooter>
                    <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
