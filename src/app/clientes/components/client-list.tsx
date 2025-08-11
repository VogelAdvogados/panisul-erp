
'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, query, where } from 'firebase/firestore';
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit, XCircle, FileText, ShoppingBag, Repeat, DollarSign, User, Building, Mail, Phone, MapPin, CreditCard, Package, RefreshCw, Calendar, Eye, Loader2 } from 'lucide-react';
import type { Customer, FinancialMovement } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { settleCustomerPayment } from '@/ai/flows/settle-customer-payment';

type FilterTab = 'all' | 'pessoa-juridica' | 'pessoa-fisica' | 'com-pendencias';

export function ClientList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerFinancials, setCustomerFinancials] = useState<FinancialMovement[]>([]);
  const [isFinancialsLoading, setIsFinancialsLoading] = useState(false);
  const [isSettlingPayment, setIsSettlingPayment] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const fetchCustomers = async () => {
       setIsLoading(true);
       try {
        const customersCollection = collection(db, 'customers');
        const customersSnapshot = await getDocs(customersCollection);
        const customersList = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(customersList);
      } catch (error) {
         toast({
            title: "Erro ao buscar clientes",
            description: "Não foi possível carregar os clientes do banco de dados.",
            variant: "destructive"
        });
        console.error("Error fetching customers: ", error);
      } finally {
        setIsLoading(false);
      }
  }

  useEffect(() => {
    fetchCustomers();
  }, [toast]);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const searchLower = searchTerm.toLowerCase();
        return customer.name.toLowerCase().includes(searchLower) ||
               (customer.doc && customer.doc.toLowerCase().includes(searchLower)) ||
               customer.email.toLowerCase().includes(searchLower);
      })
      .filter((customer) => statusFilter === 'all' ? true : customer.status === statusFilter)
      .filter((customer) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'com-pendencias') return customer.pendingAmount > 0;
        return customer.type === activeTab;
      });
  }, [customers, searchTerm, statusFilter, activeTab]);

  const counts = useMemo(() => {
    return {
      all: customers.length,
      'pessoa-juridica': customers.filter(c => c.type === 'pessoa-juridica').length,
      'pessoa-fisica': customers.filter(c => c.type === 'pessoa-fisica').length,
      'com-pendencias': customers.filter(c => c.pendingAmount > 0).length,
    }
  }, [customers]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Form submission logic would be implemented here to add/update in Firestore
  }

  const handleViewDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
    setIsFinancialsLoading(true);
    try {
        const movementsRef = collection(db, 'financialMovements');
        const q = query(movementsRef, where('referenceId', '==', customer.id), where('type', '==', 'revenue'));
        const querySnapshot = await getDocs(q);
        const financials = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as FinancialMovement);
        setCustomerFinancials(financials);
    } catch(err) {
        toast({ title: "Erro ao buscar financeiro", description: "Não foi possível carregar o histórico financeiro do cliente."});
    } finally {
        setIsFinancialsLoading(false);
    }
  }

  const handleSettlePayment = async (movement: FinancialMovement) => {
    if (!selectedCustomer) return;
    setIsSettlingPayment(movement.id);
    try {
        const result = await settleCustomerPayment({
            movementId: movement.id,
            customerId: selectedCustomer.id,
            amount: movement.amount,
        });
        toast({ title: "Sucesso!", description: result.message });
        
        // Refresh data
        handleViewDetails(selectedCustomer); // Re-fetch financials
        const customerDoc = await getDoc(doc(db, 'customers', selectedCustomer.id));
        if(customerDoc.exists()){
            const updatedCustomer = {id: customerDoc.id, ...customerDoc.data()} as Customer;
             setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
             setSelectedCustomer(updatedCustomer);
        }

    } catch (err) {
        const error = err as Error;
        toast({ title: "Erro ao dar baixa", description: error.message, variant: 'destructive' });
    } finally {
        setIsSettlingPayment(null);
    }
  }

  
  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    )
  }


  return (
    <>
      <PageHeader title="Gestão de Clientes">
         <div className='flex items-center gap-2'>
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
            <Button onClick={() => { setEditingCustomer(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2" />
              Novo Cliente
            </Button>
        </div>
      </PageHeader>
      <p className='text-muted-foreground -mt-4 mb-4'>Cadastro e histórico de clientes da padaria</p>
      
        <div className="flex items-center justify-between mb-4 gap-2">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nome, documento ou email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FilterTab)}>
                <TabsList>
                    <TabsTrigger value="all">Todos os Clientes <Badge variant="secondary" className="ml-2">{counts.all}</Badge></TabsTrigger>
                    <TabsTrigger value="pessoa-juridica">Pessoa Jurídica <Badge variant="secondary" className="ml-2">{counts['pessoa-juridica']}</Badge></TabsTrigger>
                    <TabsTrigger value="pessoa-fisica">Pessoa Física <Badge variant="secondary" className="ml-2">{counts['pessoa-fisica']}</Badge></TabsTrigger>
                    <TabsTrigger value="com-pendencias">Com Pendências <Badge variant="secondary" className="ml-2">{counts['com-pendencias']}</Badge></TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                {customer.type === 'pessoa-juridica' ? <Building className="h-6 w-6"/> : <User className="h-6 w-6" />}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{customer.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{customer.type === 'pessoa-juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                           {customer.status === 'ativo' && <Badge variant="default" className='bg-green-100 text-green-800'>Ativo</Badge>}
                           {customer.pendingAmount > 0 && <Badge variant="destructive">Pendência</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="text-sm text-muted-foreground space-y-2">
                           <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> <span>Doc: {customer.doc}</span></div>
                           <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span>{customer.email}</span></div>
                           <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <span>{customer.phone}</span></div>
                           <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>{customer.address}</span></div>
                       </div>
                       <Separator />
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total Compras</p>
                                <p className="font-bold text-green-600">{customer.totalPurchasesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> Total Pedidos</p>
                                <p className="font-bold">{customer.totalOrders}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Trocas</p>
                                <p className="font-bold">{customer.exchanges}</p>
                            </div>
                             <div className="space-y-1">
                                <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Última Compra</p>
                                <p className="font-bold">{customer.lastPurchaseDate}</p>
                            </div>
                       </div>
                       {customer.pendingAmount > 0 && (
                           <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm font-semibold flex items-center justify-between">
                               <span>Valor Pendente: {customer.pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                           </div>
                       )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center text-xs text-muted-foreground bg-muted/50 p-3">
                        <span>Cliente desde: {new Date(customer.registeredAt).toLocaleDateString('pt-BR')}</span>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(customer)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(customer)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
        {filteredCustomers.length === 0 && !isLoading && (
            <div className='text-center py-12 text-muted-foreground'>
                <XCircle className='mx-auto h-12 w-12' />
                <p className='mt-4'>Nenhum cliente encontrado.</p>
                <p className='text-sm'>Tente ajustar sua busca ou filtros.</p>
            </div>
        )}
      

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
                       Informações detalhadas, histórico e financeiro do cliente. Saldo devedor: 
                       <span className='font-bold text-destructive'> {selectedCustomer?.pendingAmount.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className='flex-grow overflow-y-auto -mx-6 px-6'>
                    <Tabs defaultValue="financial" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="financial"><DollarSign className="mr-2"/>Financeiro</TabsTrigger>
                            <TabsTrigger value="purchases"><ShoppingBag className="mr-2"/> Histórico de Compras</TabsTrigger>
                            <TabsTrigger value="exchanges"><Repeat className="mr-2"/> Histórico de Trocas</TabsTrigger>
                        </TabsList>
                        <TabsContent value="financial">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Contas a Receber</CardTitle>
                                    <CardDescription>Movimentações financeiras pendentes para este cliente.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isFinancialsLoading ? (
                                        <div className='flex justify-center items-center h-40'><Loader2 className="h-8 w-8 animate-spin"/></div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Vencimento</TableHead>
                                                    <TableHead>Descrição</TableHead>
                                                    <TableHead className='text-right'>Valor</TableHead>
                                                    <TableHead className='text-center'>Status</TableHead>
                                                    <TableHead className='text-right'>Ação</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customerFinancials.map(m => (
                                                    <TableRow key={m.id}>
                                                        <TableCell>{new Date(m.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                                        <TableCell>{m.description}</TableCell>
                                                        <TableCell className='text-right'>{m.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                                        <TableCell className='text-center'>
                                                            <Badge variant={m.status === 'paid' ? 'default' : 'destructive'}>{m.status === 'paid' ? 'Pago' : 'Pendente'}</Badge>
                                                        </TableCell>
                                                        <TableCell className='text-right'>
                                                            {m.status === 'pending' && (
                                                                <Button 
                                                                    size="sm" 
                                                                    onClick={() => handleSettlePayment(m)} 
                                                                    disabled={isSettlingPayment === m.id}
                                                                >
                                                                    {isSettlingPayment === m.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Dar Baixa'}
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {customerFinancials.length === 0 && (
                                                    <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Nenhuma movimentação financeira encontrada para este cliente.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="purchases">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compras Realizadas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                   <p className='text-muted-foreground text-center py-8'>Em breve: Histórico de produtos comprados.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="exchanges">
                             <Card>
                                <CardHeader><CardTitle>Trocas Solicitadas</CardTitle></CardHeader>
                                <CardContent><p className='text-muted-foreground text-center py-8'>Em breve: Histórico de trocas.</p></CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}
