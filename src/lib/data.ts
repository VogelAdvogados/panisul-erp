
import type { Product, Sale, Customer, ExpenseData, BillingData, OperationalSummaryItem } from './types';
import { ShoppingCart, ChefHat, RefreshCw } from 'lucide-react';

export const salesData: Sale[] = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Fev', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Abr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mai', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Ago', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Set', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Out', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dez', total: Math.floor(Math.random() * 5000) + 1000 },
];

export const operationalSummaryData: OperationalSummaryItem[] = [
    { id: '1', label: 'Vendas do Dia', value: 'R$ 1.247,50', change: '+12%', icon: ShoppingCart },
    { id: '2', label: 'Produção do Dia', value: '156 unidades', change: '+5%', icon: ChefHat },
    { id: '3', label: 'Trocas Realizadas', value: '3 trocas', change: '-2%', icon: RefreshCw },
];

export const products: Product[] = [
  { id: '1', name: 'Pão Francês', stock: 45, produced: 120, sold: 75, price: 0.75, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'french bread' },
  { id: '2', name: 'Pão de Açúcar', stock: 12, produced: 24, sold: 12, price: 1.50, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'sugar bread' },
  { id: '3', name: 'Croissant', stock: 8, produced: 20, sold: 12, price: 3.50, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'croissant pastry' },
  { id: '4', name: 'Baguete', stock: 6, produced: 15, sold: 9, price: 4.00, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'baguette bread' },
];

export const customers: Customer[] = [
    { 
        id: 'CUST-001', 
        name: 'Padaria Central', 
        email: 'contato@padariacentral.com.br', 
        phone: '(11) 3456-7890', 
        status: 'ativo', 
        registeredAt: '2023-03-14',
        type: 'pessoa-juridica',
        doc: '12.345.678/0001-90',
        address: 'Rua das Flores, 123 - Centro',
        totalPurchasesValue: 15420.50,
        totalOrders: 89,
        exchanges: 3,
        lastPurchaseDate: '13/01/2024',
        pendingAmount: 245.00,
        purchaseHistory: [
            { id: 'P001', date: '2024-05-01', product: 'Pão Francês', quantity: 200, totalValue: 180.00 },
            { id: 'P002', date: '2024-05-08', product: 'Pão de Queijo', quantity: 150, totalValue: 225.00 },
        ],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-002', 
        name: 'Mercado São João', 
        email: 'compras@mercadosaojoao.com.br', 
        phone: '(11) 2345-6789', 
        status: 'ativo', 
        registeredAt: '2022-11-19',
        type: 'pessoa-juridica',
        doc: '98.765.432/0001-10',
        address: 'Av. São João, 456 - Vila Nova',
        totalPurchasesValue: 28750.80,
        totalOrders: 156,
        exchanges: 1,
        lastPurchaseDate: '14/01/2024',
        pendingAmount: 0,
        purchaseHistory: [
            { id: 'P004', date: '2024-05-03', product: 'Baguete', quantity: 50, totalValue: 250.00 },
        ],
        exchangeHistory: [],
        financialHistory: [],
    },
     { 
        id: 'CUST-003', 
        name: 'Café da Esquina', 
        email: 'pedidos@cafedaesquina.com.br', 
        phone: '(21) 98765-4321', 
        status: 'inativo', 
        registeredAt: '2023-01-10',
        type: 'pessoa-juridica',
        doc: '11.222.333/0001-44',
        address: 'Rua do Comércio, 789 - Centro',
        totalPurchasesValue: 5300.00,
        totalOrders: 42,
        exchanges: 0,
        lastPurchaseDate: '10/12/2023',
        pendingAmount: 0,
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-004', 
        name: 'Maria Silva', 
        email: 'maria.silva@email.com', 
        phone: '(31) 91234-5678', 
        status: 'ativo', 
        registeredAt: '2024-02-28',
        type: 'pessoa-fisica',
        doc: '123.456.789-00',
        address: 'Av. Principal, 1500 - Bairro Sul',
        totalPurchasesValue: 850.75,
        totalOrders: 15,
        exchanges: 2,
        lastPurchaseDate: '18/05/2024',
        pendingAmount: 75.00,
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
];

export const expenseData: ExpenseData[] = [
  { category: 'Insumos', value: 2450, fill: 'var(--color-insumos)' },
  { category: 'Salários', value: 1800, fill: 'var(--color-salarios)' },
  { category: 'Energia', value: 420, fill: 'var(--color-energia)' },
  { category: 'Aluguel', value: 500, fill: 'var(--color-aluguel)' },
  { category: 'Outros', value: 280, fill: 'var(--color-outros)' },
];

export const billingData: BillingData[] = [
  { day: 'Seg', total: 1250 },
  { day: 'Ter', total: 1500 },
  { day: 'Qua', total: 1100 },
  { day: 'Qui', total: 1800 },
  { day: 'Sex', total: 2200 },
  { day: 'Sáb', total: 950 },
  { day: 'Dom', total: 700 },
];
