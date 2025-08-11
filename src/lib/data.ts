

import type { Product, Sale, Customer, ExpenseChartItem, BillingData, OperationalSummaryItem, Purchase, Supplier, Ingredient, Recipe, FinancialMovement } from './types';
import { ShoppingCart, ChefHat, RefreshCw } from 'lucide-react';
import { expenseCategories } from './categories';

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

export const products: Omit<Product, 'id'>[] = [
  { name: 'Pão Francês', stock: 45, produced: 120, sold: 75, price: 0.75, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'french bread' },
  { name: 'Croissant', stock: 8, produced: 20, sold: 12, price: 3.50, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'croissant' },
  { name: 'Baguete', stock: 6, produced: 15, sold: 9, price: 4.00, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'baguette' },
  { name: 'Pão de Queijo', stock: 25, produced: 60, sold: 35, price: 2.50, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'cheese bread' },
  { name: 'Sonho', stock: 12, produced: 24, sold: 12, price: 4.50, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'cream donut' },
];

export const customers: Omit<Customer, 'id'>[] = [
    { 
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
];

export const expenseChartData: ExpenseChartItem[] = [
  { category: 'insumos', value: 2350.50, fill: expenseCategories.insumos.color },
  { category: 'salarios', value: 4800, fill: expenseCategories.salarios.color },
  { category: 'infraestrutura', value: 620, fill: expenseCategories.infraestrutura.color },
  { category: 'impostos', value: 950, fill: expenseCategories.impostos.color },
  { category: 'outros', value: 280, fill: expenseCategories.outros.color },
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

export const initialFinancialMovements: Omit<FinancialMovement, 'id'>[] = [
    { description: 'Compra de Insumos NFE-12345', referenceId: 'PUR-001', dueDate: '2024-06-15', amount: 1500, status: 'paid', paymentDate: '2024-06-14', category: 'insumos', sourceAccount: 'bank' },
    { description: 'Compra de Insumos NFE-12360', referenceId: 'PUR-002', dueDate: '2024-05-20', amount: 850.50, status: 'pending', category: 'insumos', sourceAccount: 'bank' },
    { description: 'Conta de Energia', dueDate: '2024-06-10', amount: 450.80, status: 'paid', paymentDate: '2024-06-10', category: 'infraestrutura', sourceAccount: 'bank' },
    { description: 'Salários Funcionários', dueDate: '2024-06-05', amount: 4800, status: 'paid', paymentDate: '2024-06-05', category: 'salarios', sourceAccount: 'bank' },
    { description: 'Aluguel', dueDate: '2024-06-10', amount: 1200, status: 'pending', category: 'infraestrutura', sourceAccount: 'bank' },
];

export const purchases: Omit<Purchase, 'id'>[] = [
    {
        invoiceNumber: 'NFE-12345',
        supplierId: 'SUP-001',
        date: '2024-05-15',
        totalAmount: 1500.00,
        paymentMethod: 'boleto',
        items: [
            { name: 'Farinha de Trigo', quantity: 50, unitPrice: 5.50 },
            { name: 'Fermento Biológico', quantity: 10, unitPrice: 12.00 },
        ],
        financialMovements: [] // This will be populated dynamically or linked via referenceId
    },
    {
        invoiceNumber: 'NFE-12360',
        supplierId: 'SUP-002',
        date: '2024-05-20',
        totalAmount: 850.50,
        paymentMethod: 'pix',
        items: [
            { name: 'Ovos', quantity: 360, unitPrice: 0.80 },
            { name: 'Manteiga', quantity: 20, unitPrice: 20.00 },
        ],
        financialMovements: []
    }
];

export const ingredients: Omit<Ingredient, 'id'>[] = [
    { name: 'Farinha de Trigo', stock: 25000, unitOfMeasure: 'g', cost: 0.0055 }, // R$ 5,50/kg
    { name: 'Açúcar Refinado', stock: 10000, unitOfMeasure: 'g', cost: 0.004 }, // R$ 4,00/kg
    { name: 'Fermento Biológico Seco', stock: 500, unitOfMeasure: 'g', cost: 0.03 }, // R$ 30,00/kg
    { name: 'Sal', stock: 1000, unitOfMeasure: 'g', cost: 0.002 }, // R$ 2,00/kg
    { name: 'Manteiga', stock: 2000, unitOfMeasure: 'g', cost: 0.04 }, // R$ 40,00/kg
];

export const recipes: Omit<Recipe, 'id'>[] = [
    {
        productId: 'PROD-001', // Pão Francês
        items: [
            { ingredientId: 'ING-001', quantity: 100 }, // 100g de Farinha
            { ingredientId: 'ING-003', quantity: 2 }, // 2g de Fermento
            { ingredientId: 'ING-004', quantity: 2 }, // 2g de Sal
        ]
    },
     {
        productId: 'PROD-002', // Croissant
        items: [
            { ingredientId: 'ING-001', quantity: 80 }, // 80g de Farinha
            { ingredientId: 'ING-005', quantity: 40 }, // 40g de Manteiga
            { ingredientId: 'ING-002', quantity: 10 }, // 10g de Açúcar
            { ingredientId: 'ING-003', quantity: 1.5 }, // 1.5g de Fermento
            { ingredientId: 'ING-004', quantity: 1 }, // 1g de Sal
        ]
    }
];

// Helper to add IDs to initial data for seeding
function withIds<T>(items: T[], prefix: string): (T & { id: string })[] {
  return items.map((item, index) => ({
    ...item,
    id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
  }));
}

// Re-exporting with IDs for seeding process
export const initialProducts = withIds(products, 'PROD');
export const initialIngredients = withIds(ingredients, 'ING');
export const initialRecipes = withIds(recipes, 'REC');
export const initialCustomers = withIds(customers, 'CUST');
// Other exports can be created as needed if they also need to be seeded with consistent IDs.

    