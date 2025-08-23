
// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from '@/lib/netly';
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
import { MoreHorizontal, Edit, Trash2, User, Loader2, PlusCircle } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { registerEmployee } from '@/services/register-employee';

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const employeesCollection = collection(db, 'employees');
      const snapshot = await getDocs(employeesCollection);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(list);
    } catch (error) {
      toast({
          title: "Erro ao buscar funcionários",
          description: "Não foi possível carregar os funcionários do banco de dados.",
          variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenForm = (employee: Employee | null) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingEmployee(null);
    setIsFormOpen(false);
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteDoc(doc(db, "employees", id));
        await fetchEmployees();
        toast({ title: "Funcionário Excluído!", description: "O funcionário foi removido com sucesso." });
    } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível excluir o funcionário.", variant: "destructive" });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const employeeData = {
      id: editingEmployee?.id,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      salary: parseFloat(formData.get('salary') as string),
      admissionDate: formData.get('admissionDate') as string,
      status: formData.get('status') as 'ativo' | 'inativo',
    };

    try {
        const result = await registerEmployee(employeeData);
        toast({ title: "Sucesso!", description: result.message });
        await fetchEmployees();
        handleCloseForm();
    } catch(error) {
         toast({ title: "Erro!", description: (error as Error).message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
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
                    <CardTitle>Funcionários</CardTitle>
                    <CardDescription>Gerencie sua equipe de colaboradores.</CardDescription>
                </div>
                <Button onClick={() => handleOpenForm(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Funcionário
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Data de Admissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((person) => (
                    <TableRow key={person.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{person.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{person.role}</TableCell>
                        <TableCell>{person.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
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
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o funcionário.
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
                    {employees.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Nenhum funcionário encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>

    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => { if(isSubmitting) e.preventDefault()}} onEscapeKeyDown={(e) => { if(isSubmitting) e.preventDefault()}}>
            <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</DialogTitle>
                <DialogDescription>
                    {editingEmployee ? 'Altere os dados do funcionário.' : 'Preencha os dados para cadastrar um novo funcionário.'}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input id="name" name="name" defaultValue={editingEmployee?.name || ''} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Cargo</Label>
                        <Input id="role" name="role" defaultValue={editingEmployee?.role || ''} className="col-span-3" required/>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salary" className="text-right">Salário</Label>
                        <Input id="salary" name="salary" type="number" step="0.01" defaultValue={editingEmployee?.salary || 0} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="admissionDate" className="text-right">Data Admissão</Label>
                        <Input id="admissionDate" name="admissionDate" type="date" defaultValue={editingEmployee?.admissionDate || ''} className="col-span-3" required/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue={editingEmployee?.status || 'ativo'}>
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
