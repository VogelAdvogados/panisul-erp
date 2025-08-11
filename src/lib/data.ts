import type { Product, Sale, OperationalSummaryItem } from './types';

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
