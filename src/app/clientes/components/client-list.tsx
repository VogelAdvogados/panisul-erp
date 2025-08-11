
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit, XCircle, FileText, ShoppingBag, Repeat, DollarSign } from 'lucide-react';
import { customers as initialCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ClientList() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const { toast } = useToast();

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    const newCustomerData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        status: formData.get('status') as 'ativo' | 'inativo' | 'pendente',
    };

    if (editingCustomer) {
        const updatedCustomer = { ...editingCustomer, ...newCustomerData };
        setCustomers(customers.map(c => c.id === editingCustomer.id ? updatedCustomer : c));
        toast({ title: "Cliente Atualizado!", description: "Os dados do cliente foram atualizados." });
    } else {
        const customerToAdd: Customer = {
            id: `CUST-${Date.now()}`,
            registeredAt: new Date().toISOString().split('T')[0],
            purchaseHistory: [],
            exchangeHistory: [],
            financialHistory: [],
            ...newCustomerData,
        };
        setCustomers([customerToAdd, ...customers]);
        toast({ title: "Cliente Adicionado!", description: "Um novo cliente foi cadastrado no sistema." });
    }
    
    setIsFormOpen(false);
    setEditingCustomer(null);
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  }

  const formatPhoneForWhatsapp = (phone: string) => {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
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
                    placeholder="Buscar por nome..."
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
                <TableHead>Telefone</TableHead>
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
                    <TableCell className="font-medium">
                        <Button variant="link" onClick={() => handleViewDetails(customer)} className="p-0 h-auto font-medium">
                            {customer.name}
                        </Button>
                    </TableCell>
                    <TableCell>
                        <a href={formatPhoneForWhatsapp(customer.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-whatsapp text-green-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                           {customer.phone}
                        </a>
                    </TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewDetails(customer)}>
                            <FileText className='mr-2' /> Ver Ficha
                        </DropdownMenuItem>
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

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Ficha do Cliente: {selectedCustomer?.name}</DialogTitle>
                    <DialogDescription>
                       Informações detalhadas, histórico e financeiro do cliente.
                    </DialogDescription>
                </DialogHeader>
                <div className='flex-grow overflow-y-auto -mx-6 px-6'>
                    <Tabs defaultValue="purchases" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="purchases"><ShoppingBag className="mr-2"/> Histórico de Compras</TabsTrigger>
                            <TabsTrigger value="exchanges"><Repeat className="mr-2"/> Histórico de Trocas</TabsTrigger>
                            <TabsTrigger value="financial"><DollarSign className="mr-2"/>Financeiro</TabsTrigger>
                        </TabsList>
                        <TabsContent value="purchases">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compras Realizadas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Produto</TableHead>
                                                <TableHead className='text-right'>Quantidade</TableHead>
                                                <TableHead className='text-right'>Valor Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedCustomer?.purchaseHistory.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{new Date(p.date).toLocaleDateString('pt-BR')}</TableCell>
                                                    <TableCell>{p.product}</TableCell>
                                                    <TableCell className='text-right'>{p.quantity}</TableCell>
                                                    <TableCell className='text-right'>{p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                                </TableRow>
                                            ))}
                                             {selectedCustomer?.purchaseHistory.length === 0 && (
                                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma compra registrada.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="exchanges">
                             <Card>
                                <CardHeader><CardTitle>Trocas Solicitadas</CardTitle></CardHeader>
                                <CardContent><p>Tabela de trocas aqui...</p></CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="financial">
                             <Card>
                                <CardHeader><CardTitle>Situação Financeira</CardTitle></CardHeader>
                                <CardContent><p>Dados financeiros aqui...</p></CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}
