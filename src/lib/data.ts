import type { Product, Sale, OperationalSummaryItem, Customer } from './types';

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
    { id: '1', customer: 'Padaria Pão Quente', description: 'Pagamento de Fatura #1023', type: 'Recebimento', amount: '+ R$ 1.200,00' },
    { id: '2', customer: 'Mercado Central', description: 'Venda de 100 pães franceses', type: 'Venda', amount: '+ R$ 85,00' },
    { id: '3', customer: 'Fornecedor Farinita', description: 'Pagamento de NF #589', type: 'Pagamento', amount: '- R$ 2.500,00' },
    { id: '4', customer: 'Supermercado Bom Preço', description: 'Venda de 50 pães de queijo', type: 'Venda', amount: '+ R$ 75,00' },
];

export const products: Product[] = [
  { id: '1', name: 'Pão Francês', stock: 250, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'french bread' },
  { id: '2', name: 'Pão de Queijo', stock: 150, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'cheese bread' },
  { id: '3', name: 'Croissant', stock: 80, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'croissant pastry' },
  { id: '4', name: 'Bolo de Chocolate', stock: 15, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'chocolate cake' },
  { id: '5', name: 'Sonho de Creme', stock: 45, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'cream pastry' },
  { id: '6', name: 'Baguete', stock: 60, imageUrl: 'https://placehold.co/600x400.png', 'data-ai-hint': 'baguette bread' },
];

export const customers: Customer[] = [
    { 
        id: 'CUST-001', name: 'Padaria Pão Quente', email: 'contato@paoquente.com', phone: '(11) 98765-4321', status: 'ativo', registeredAt: '2023-01-15',
        purchaseHistory: [
            { id: 'P001', date: '2024-05-01', product: 'Pão Francês', quantity: 200, totalValue: 180.00 },
            { id: 'P002', date: '2024-05-08', product: 'Pão de Queijo', quantity: 150, totalValue: 225.00 },
            { id: 'P003', date: '2024-05-15', product: 'Pão Francês', quantity: 250, totalValue: 225.00 },
        ],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-002', name: 'Mercado Central', email: 'compras@mercadocentral.com', phone: '(21) 99999-8888', status: 'ativo', registeredAt: '2023-02-20',
        purchaseHistory: [
            { id: 'P004', date: '2024-05-03', product: 'Baguete', quantity: 50, totalValue: 250.00 },
        ],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-003', name: 'Supermercado Bom Preço', email: 'adm@bompreco.com.br', phone: '(31) 91234-5678', status: 'ativo', registeredAt: '2023-03-10',
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-004', name: 'Cafeteria Aroma', email: 'cafe@aroma.com', phone: '(41) 98877-6655', status: 'inativo', registeredAt: '2023-04-05',
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-005', name: 'Restaurante Sabor Divino', email: 'gerencia@sabordivino.com', phone: '(51) 99654-3210', status: 'ativo', registeredAt: '2023-05-25',
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-006', name: 'Lanchonete do Zé', email: 'ze@lanchonete.com', phone: '(61) 98111-2233', status: 'pendente', registeredAt: '2023-06-30',
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-007', name: 'Hotel Beira Mar', email: 'reservas@hotelbeiramar.com', phone: '(71) 99900-1122', status: 'ativo', registeredAt: '2023-07-12',
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
    { 
        id: 'CUST-008', name: 'Dona Benta Doces', email: 'encomendas@donabenta.com', phone: '(81) 98765-1234', status: 'ativo', registeredAt: '2023-08-19',
        purchaseHistory: [],
        exchangeHistory: [],
        financialHistory: [],
    },
];
