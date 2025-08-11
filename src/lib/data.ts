

import type { Product, Sale, Customer, ExpenseData, BillingData, OperationalSummaryItem, Purchase, Supplier, Ingredient, Recipe } from './types';
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
  { id: '2', name: 'Croissant', stock: 8, produced: 20, sold: 12, price: 3.50, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'croissant' },
  { id: '3', name: 'Baguete', stock: 6, produced: 15, sold: 9, price: 4.00, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'baguette' },
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

export const suppliers: Supplier[] = [
    { id: 'SUP-001', name: 'Farinhas & Cia', cnpj: '11.111.111/0001-11', contact: 'João' },
    { id: 'SUP-002', name: 'Ovos de Ouro', cnpj: '22.222.222/0001-22', contact: 'Maria' },
];

export const purchases: Purchase[] = [
    {
        id: 'PUR-001',
        invoiceNumber: 'NFE-12345',
        supplierId: 'SUP-001',
        date: '2024-05-15',
        totalAmount: 1500.00,
        status: 'paid',
        items: [
            { name: 'Farinha de Trigo', quantity: 50, unitPrice: 5.50 },
            { name: 'Fermento Biológico', quantity: 10, unitPrice: 12.00 },
        ]
    },
    {
        id: 'PUR-002',
        invoiceNumber: 'NFE-12360',
        supplierId: 'SUP-002',
        date: '2024-05-20',
        totalAmount: 850.50,
        status: 'pending',
        items: [
            { name: 'Ovos', quantity: 360, unitPrice: 0.80 },
            { name: 'Manteiga', quantity: 20, unitPrice: 20.00 },
        ]
    }
];

export const ingredients: Ingredient[] = [
    { id: 'ING-001', name: 'Farinha de Trigo', stock: 25000, unitOfMeasure: 'g', cost: 0.0055 }, // R$ 5,50/kg
    { id: 'ING-002', name: 'Açúcar Refinado', stock: 10000, unitOfMeasure: 'g', cost: 0.004 }, // R$ 4,00/kg
    { id: 'ING-003', name: 'Fermento Biológico Seco', stock: 500, unitOfMeasure: 'g', cost: 0.03 }, // R$ 30,00/kg
    { id: 'ING-004', name: 'Sal', stock: 1000, unitOfMeasure: 'g', cost: 0.002 }, // R$ 2,00/kg
    { id: 'ING-005', name: 'Manteiga', stock: 2000, unitOfMeasure: 'g', cost: 0.04 }, // R$ 40,00/kg
];

export const recipes: Recipe[] = [
    {
        id: 'REC-001',
        productId: '1', // Pão Francês
        items: [
            { ingredientId: 'ING-001', quantity: 100 }, // 100g de Farinha
            { ingredientId: 'ING-003', quantity: 2 }, // 2g de Fermento
            { ingredientId: 'ING-004', quantity: 2 }, // 2g de Sal
        ]
    },
     {
        id: 'REC-002',
        productId: '2', // Croissant
        items: [
            { ingredientId: 'ING-001', quantity: 80 }, // 80g de Farinha
            { ingredientId: 'ING-005', quantity: 40 }, // 40g de Manteiga
            { ingredientId: 'ING-002', quantity: 10 }, // 10g de Açúcar
            { ingredientId: 'ING-003', quantity: 1.5 }, // 1.5g de Fermento
            { ingredientId: 'ING-004', quantity: 1 }, // 1g de Sal
        ]
    }
];
