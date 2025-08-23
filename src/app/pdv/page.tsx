
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product, Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Trash2, Package, ShoppingCart, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/page-header';
import { RegisterSaleForm } from './components/register-sale-form';

export interface CartItem {
  product: Product;
  quantity: number;
}

export default function PdvPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsSnapshot, customersSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'customers')),
      ]);
      const productList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productList);
      const customerList = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customerList);
    } catch (error) {
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar produtos ou clientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
           return prevCart.map(item =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          toast({ title: "Estoque máximo atingido", description: `Não há mais unidades de ${product.name} disponíveis.`});
          return prevCart;
        }
      }
      if (product.stock > 0) {
        return [...prevCart, { product, quantity: 1 }];
      } else {
        toast({ title: "Produto sem estoque", description: `${product.name} não está disponível.`});
        return prevCart;
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
        const itemToUpdate = prevCart.find(item => item.product.id === productId);
        if (!itemToUpdate) return prevCart;

        if (quantity <= 0) {
            return prevCart.filter(item => item.product.id !== productId);
        }
        if (quantity > itemToUpdate.product.stock) {
             toast({ title: "Estoque máximo atingido", description: `Apenas ${itemToUpdate.product.stock} unidades de ${itemToUpdate.product.name} disponíveis.`});
             return prevCart.map(item => item.product.id === productId ? { ...item, quantity: itemToUpdate.product.stock } : item);
        }
        return prevCart.map(item => item.product.id === productId ? { ...item, quantity } : item);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const handleSaleSuccess = () => {
      setCart([]);
      setIsCheckoutOpen(false);
      fetchData(); // Refresh product stock
  }

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);
  

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="p-4 sm:p-6 lg:p-8 border-b">
            <PageHeader title="Ponto de Venda (PDV)" />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start p-4 sm:p-6 lg:p-8 overflow-hidden">
          
          {/* Products List */}
          <div className="lg:col-span-2 h-full flex flex-col">
            <Card className='flex-1 flex flex-col'>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Selecione os Produtos</CardTitle>
                     <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar produto..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                    </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
                        {filteredProducts.map(product => (
                        <Card 
                            key={product.id} 
                            className={`shadow-sm hover:shadow-md transition-shadow cursor-pointer ${product.stock === 0 ? 'opacity-50' : ''}`}
                            onClick={() => addToCart(product)}
                        >
                            <CardHeader className="p-0">
                            <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-t-lg overflow-hidden">
                                <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                            </CardHeader>
                            <CardContent className="p-3">
                            <h3 className="font-semibold truncate">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">Estoque: {product.stock}</p>
                            <p className="text-md font-bold">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground h-full flex flex-col justify-center items-center">
                        <XCircle className='mx-auto h-12 w-12' />
                        <p className='mt-4 font-semibold'>Nenhum produto encontrado</p>
                        <p className='text-sm'>Tente refinar sua busca.</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1 h-full">
            <Card className="sticky top-4 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart /> Carrinho</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground h-full flex flex-col justify-center items-center">
                            <p className='font-medium'>Seu carrinho está vazio.</p>
                            <p className='text-sm'>Clique em um produto para adicionar.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex items-center gap-4">
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                    <Input 
                                        type="number" 
                                        className="w-20 h-9 text-center" 
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value, 10))}
                                        min={1}
                                        max={item.product.stock}
                                    />
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeFromCart(item.product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex-col space-y-4 border-t pt-4">
                <div className="w-full flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <Button 
                    className="w-full text-lg py-6" 
                    disabled={cart.length === 0}
                    onClick={() => setIsCheckoutOpen(true)}
                >
                    Finalizar Venda
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venda: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</DialogTitle>
            <DialogDescription>
              Selecione o cliente (se houver) e a forma de pagamento para concluir a venda.
            </DialogDescription>
          </DialogHeader>
          <RegisterSaleForm
            cart={cart}
            total={total}
            customers={customers}
            onSaleRegistered={handleSaleSuccess}
          />
        </DialogContent>
      </Dialog>
      </>
    );
}

