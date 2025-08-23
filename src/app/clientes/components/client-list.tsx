
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, Search, Trash2, Edit, XCircle, FileText, ShoppingBag, Repeat, DollarSign, User, Building, Mail, Phone, MapPin, CreditCard, Package, RefreshCw, Calendar, Eye, Loader2, ArrowRight, MessageCircle } from 'lucide-react';
import type { Customer, FinancialMovement, Sale, Exchange, Product } from '@/lib/types';
import PageHeader from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { settleCustomerPayment } from '@/ai/flows/settle-customer-payment';
import { registerCustomer } from '@/ai/flows/register-customer';


type FilterTab = 'all' | 'pessoa-juridica' | 'pessoa-fisica' | 'com-pendencias';

interface ClientListProps {
    customerToOpen: string | null;
}

function formatPhoneForDisplay(phone: string) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return digits;
}

function formatPhoneForWhatsApp(phone: string) {
    return phone.replace(/\D/g, '');
}

export function ClientList({ customerToOpen }: ClientListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerFinancials, setCustomerFinancials] = useState<FinancialMovement[]>([]);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [customerExchanges, setCustomerExchanges] = useState<Exchange[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSettlingPayment, setIsSettlingPayment] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const fetchData = useCallback(async (): Promise<Customer[]> => {
       setIsLoading(true);
       let customersList: Customer[] = [];
       try {
        const [customersSnapshot, productsSnapshot] = await Promise.all([
            getDocs(query(collection(db, 'customers'), orderBy('name', 'asc'))),
            getDocs(collection(db, 'products'))
        ]);
        customersList = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(customersList);

        const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productList);
        setProductsMap(new Map(productList.map(p => [p.id, p])));

      } catch (error) {
         toast({
            title: "Erro ao buscar dados",
            description: "Não foi possível carregar os clientes ou produtos.",
            variant: "destructive"
        });
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
      return customersList;
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetails = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
    setIsHistoryLoading(true);
    try {
        const salesQuery = query(collection(db, 'sales'), where('customerId', '==', customer.id), orderBy('date', 'desc'));
        const exchangesQuery = query(collection(db, 'exchanges'), where('customerId', '==', customer.id), orderBy('date', 'desc'));
        const financialsQuery = query(collection(db, 'financialMovements'), where('referenceId', '==', customer.id));

        const [salesSnapshot, exchangesSnapshot, financialsSnapshot] = await Promise.all([
            getDocs(salesQuery),
            getDocs(exchangesQuery),
            getDocs(financialsQuery)
        ]);

        const sales = salesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as Sale);
        setCustomerSales(sales);
        
        const financials = financialsSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as FinancialMovement);
        setCustomerFinancials(financials.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));

        const exchanges = exchangesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as Exchange);
        setCustomerExchanges(exchanges);

    } catch(err) {
        toast({ title: "Erro ao buscar histórico", description: "Não foi possível carregar o histórico completo do cliente."});
    } finally {
        setIsHistoryLoading(false);
    }
  }, [toast]);


  useEffect(() => {
      if (customerToOpen && customers.length > 0) {
          const customer = customers.find(c => c.id === customerToOpen);
          if (customer) {
              handleViewDetails(customer);
          }
      }
  }, [customerToOpen, customers, handleViewDetails]);


  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => {
        const searchLower = searchTerm.toLowerCase();
        return customer.name.toLowerCase().includes(searchLower) ||
               (customer.doc && customer.doc.toLowerCase().includes(searchLower)) ||
               (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
               (customer.phone && customer.phone.toLowerCase().includes(searchLower));
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
  
  const handleOpenForm = (customer: Customer | null) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  }

  const handleCloseForm = () => {
    setEditingCustomer(null);
    setIsFormOpen(false);
  }


  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const customerData = {
      id: editingCustomer?.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      doc: formData.get('doc') as string,
      address: formData.get('address') as string,
      type: formData.get('type') as 'pessoa-fisica' | 'pessoa-juridica',
      status: formData.get('status') as 'ativo' | 'inativo',
      notes: (formData.get('notes') as string) || '',
    };

    try {
        const { customerId, message } = await registerCustomer(customerData);
        toast({ title: "Sucesso!", description: message });
        const updatedCustomers = await fetchData();
        const createdCustomer = updatedCustomers.find(c => c.id === customerId);
        if (createdCustomer) {
            handleViewDetails(createdCustomer);
        }
        handleCloseForm();
    } catch(err) {
        const error = err as Error;
        toast({ title: "Erro ao salvar cliente", description: error.message, variant: 'destructive'});
    } finally {
        setIsSubmitting(false);
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
        
        await handleViewDetails(selectedCustomer);
        await fetchData();
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
                </SelectContent>
            </Select>
            <Button onClick={() => handleOpenForm(null)}>
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
                    placeholder="Buscar por nome, documento, email ou telefone..."
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
                    <TabsTrigger value="com-pendencias">Com Pendências <Badge variant="destructive" className="ml-2">{counts['com-pendencias']}</Badge></TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCustomers.map((customer) => (
                <Card
                    key={customer.id}
                    className="shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(customer)}
                >
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
                           {customer.status === 'ativo' ? <Badge variant="default" className='bg-green-100 text-green-800'>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}
                           {customer.pendingAmount > 0 && <Badge variant="destructive">Pendência</Badge>}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="text-sm text-muted-foreground space-y-2">
                           <div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> <span>Doc: {customer.doc}</span></div>
                           <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> <span>{customer.email || 'N/A'}</span></div>
                           <div className="flex items-center gap-2">
                               <Phone className="h-4 w-4" />
                               <a
                                   href={`https://wa.me/${formatPhoneForWhatsApp(customer.phone)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-1 text-blue-600 hover:underline"
                               >
                                   {formatPhoneForDisplay(customer.phone)}
                                   <MessageCircle className="h-4 w-4" />
                               </a>
                           </div>
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
                                <p className="font-bold">{customer.lastPurchaseDate || 'N/A'}</p>
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
            <DialogContent className="sm:max-w-lg">
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
                            <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Telefone</Label>
                            <Input id="phone" name="phone" defaultValue={editingCustomer?.phone} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="doc" className="text-right">CPF/CNPJ</Label>
                            <Input id="doc" name="doc" defaultValue={editingCustomer?.doc} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">Endereço</Label>
                            <Input id="address" name="address" defaultValue={editingCustomer?.address} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Tipo</Label>
                             <Select name="type" defaultValue={editingCustomer?.type || 'pessoa-fisica'}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pessoa-fisica">Pessoa Física</SelectItem>
                                    <SelectItem value="pessoa-juridica">Pessoa Jurídica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                             <Select name="status" defaultValue={editingCustomer?.status || 'ativo'}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="notes" className="text-right">Anotações</Label>
                            <Textarea id="notes" name="notes" defaultValue={editingCustomer?.notes} className="col-span-3" />
                        </div>
                    </div>
                     <DialogFooter>
                        <Button type="button" variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                        </Button>
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
                    {selectedCustomer?.notes && (
                        <div className="my-4 p-4 bg-muted rounded-md">
                            <h3 className="font-medium mb-1">Anotações</h3>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                        </div>
                    )}
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
                                    <CardDescription>Movimentações financeiras pendentes e pagas para este cliente.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isHistoryLoading ? (
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
                                    {isHistoryLoading ? (
                                         <div className='flex justify-center items-center h-40'><Loader2 className="h-8 w-8 animate-spin"/></div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Data</TableHead>
                                                    <TableHead>Itens</TableHead>
                                                    <TableHead className='text-right'>Valor Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customerSales.map(sale => (
                                                    <TableRow key={sale.id}>
                                                        <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                                        <TableCell>
                                                            <ul className='text-sm'>
                                                                {sale.items.map((item, index) => <li key={index}>- {item.quantity}x {item.productName}</li>)}
                                                            </ul>
                                                        </TableCell>
                                                        <TableCell className='text-right font-medium'>{sale.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {customerSales.length === 0 && (
                                                    <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Nenhuma compra registrada para este cliente.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="exchanges">
                             <Card>
                                <CardHeader><CardTitle>Trocas Solicitadas</CardTitle></CardHeader>
                                <CardContent>
                                    {isHistoryLoading ? (
                                        <div className='flex justify-center items-center h-40'><Loader2 className="h-8 w-8 animate-spin"/></div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Data</TableHead>
                                                    <TableHead>Troca Realizada</TableHead>
                                                    <TableHead>Motivo</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customerExchanges.map(exchange => (
                                                    <TableRow key={exchange.id}>
                                                        <TableCell>{new Date(exchange.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                            <span className="text-red-600">{productsMap.get(exchange.returnedProductId)?.name || 'N/A'}</span>
                                                            <ArrowRight className="h-4 w-4 text-muted-foreground"/>
                                                            <span className="text-green-600">{productsMap.get(exchange.newProductId)?.name || 'N/A'}</span>
                                                        </TableCell>
                                                        <TableCell className='text-muted-foreground'>{exchange.reason}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {customerExchanges.length === 0 && (
                                                     <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Nenhuma troca registrada para este cliente.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}

    