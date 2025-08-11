
'use client';

import { useState, useMemo } from 'react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit, XCircle } from 'lucide-react';
import { customers as initialCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ClientList() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((customer) =>
        statusFilter === 'all' ? true : customer.status === statusFilter
      );
  }, [customers, searchTerm, statusFilter]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast({
        title: "Cliente Excluído!",
        description: "O cliente foi removido do sistema.",
        variant: "destructive"
    })
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCustomer: Omit<Customer, 'id' | 'registeredAt'> & { id?: string; registeredAt?: string } = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        status: formData.get('status') as 'ativo' | 'inativo' | 'pendente',
    };

    if (editingCustomer) {
        const updatedCustomer = { ...editingCustomer, ...newCustomer };
        setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
        toast({ title: "Cliente Atualizado!", description: "Os dados do cliente foram atualizados." });
    } else {
        const customerToAdd: Customer = {
            ...newCustomer,
            id: `CUST-${Date.now()}`,
            registeredAt: new Date().toISOString().split('T')[0],
        };
        setCustomers([customerToAdd, ...customers]);
        toast({ title: "Cliente Adicionado!", description: "Um novo cliente foi cadastrado no sistema." });
    }
    
    setIsFormOpen(false);
    setEditingCustomer(null);
  }

  const getStatusVariant = (status: Customer['status']) => {
    switch (status) {
      case 'ativo':
        return 'default';
      case 'inativo':
        return 'destructive';
      case 'pendente':
        return 'secondary';
      default:
        return 'outline';
    }
  };


  return (
    <>
      <PageHeader title="Clientes">
        <Button onClick={() => { setEditingCustomer(null); setIsFormOpen(true); }}>
          <PlusCircle className="mr-2" />
          Adicionar Cliente
        </Button>
      </PageHeader>
      
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-2">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nome ou e-mail..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className='hidden md:table-cell'>E-mail</TableHead>
                <TableHead className='hidden sm:table-cell'>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='hidden lg:table-cell'>Desde</TableHead>
                <TableHead>
                    <span className="sr-only">Ações</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className='hidden md:table-cell'>{customer.email}</TableCell>
                    <TableCell className='hidden sm:table-cell'>{customer.phone}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(customer.status)}>{customer.status}</Badge>
                    </TableCell>
                    <TableCell className='hidden lg:table-cell'>{new Date(customer.registeredAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(customer)}>
                            <Edit className='mr-2' /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className='mr-2' /> Excluir
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        {filteredCustomers.length === 0 && (
            <div className='text-center py-12 text-muted-foreground'>
                <XCircle className='mx-auto h-12 w-12' />
                <p className='mt-4'>Nenhum cliente encontrado.</p>
                <p className='text-sm'>Tente ajustar sua busca ou filtros.</p>
            </div>
        )}
      </div>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
                    <DialogDescription>
                        {editingCustomer ? 'Altere os dados abaixo para atualizar o cliente.' : 'Preencha os dados abaixo para cadastrar um novo cliente.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFormSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nome</Label>
                            <Input id="name" name="name" defaultValue={editingCustomer?.name} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} className="col-span-3" required/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Telefone</Label>
                            <Input id="phone" name="phone" defaultValue={editingCustomer?.phone} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                             <Select name="status" defaultValue={editingCustomer?.status || 'ativo'}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">{editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>
  );
}

