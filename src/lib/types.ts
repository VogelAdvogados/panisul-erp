

export interface Sale {
    name: string;
    total: number;
}

export interface OperationalSummaryItem {
    id: string;
    label: string;
    value: string;
    change: string;
    icon: React.ElementType;
}

export interface Product {
    id: string;
    name: string;
    stock: number;
    produced: number;
    sold: number;
    price: number;
    imageUrl: string;
    'data-ai-hint': string;
}

export interface PurchaseHistoryItem {
    id: string;
    date: string;
    product: string;
    quantity: number;
    totalValue: number;
}

export interface ExchangeHistoryItem {
    id: string;
    date: string;
    productIn: string;
    productOut: string;
    reason: string;
}

export interface FinancialHistoryItem {
    id: string;
    date: string;
    description: string;
    type: 'payment' | 'charge';
    value: number;
    status: 'paid' | 'pending' | 'overdue';
}


export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ativo' | 'inativo' | 'pendente';
  registeredAt: string;
  type: 'pessoa-juridica' | 'pessoa-fisica';
  doc: string;
  address: string;
  totalPurchasesValue: number;
  totalOrders: number;
  exchanges: number;
  lastPurchaseDate: string;
  pendingAmount: number;
  purchaseHistory: PurchaseHistoryItem[];
  exchangeHistory: ExchangeHistoryItem[];
  financialHistory: FinancialHistoryItem[];
}

export interface ExpenseData {
  category: string;
  value: number;
  fill: string;
}

export interface BillingData {
  day: string;
  total: number;
}

export interface Supplier {
    id: string;
    name: string;
    cnpj: string;
    contact: string;
}

export interface Purchase {
    id: string;
    invoiceNumber: string;
    supplierId: string;
    date: string;
    totalAmount: number;
    status: 'pending' | 'paid' | 'overdue';
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
    }>;
}
