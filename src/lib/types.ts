



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

export type ExpenseCategory = 'insumos' | 'salarios' | 'infraestrutura' | 'marketing' | 'impostos' | 'outros' | 'vendas';

export interface ExpenseChartItem {
  category: ExpenseCategory;
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

export type PaymentMethod = 'pix' | 'boleto' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';
export type SourceAccount = 'cash' | 'bank';
export type MovementType = 'revenue' | 'expense';


export interface FinancialMovement {
    id: string;
    description: string;
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    type: MovementType;
    paymentDate?: string;
    category: ExpenseCategory;
    referenceId?: string; // e.g., purchaseId or expenseId
    sourceAccount: SourceAccount;
}

export interface Purchase {
    id: string;
    invoiceNumber: string;
    supplierId: string;
    date: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
    }>;
    financialMovements?: FinancialMovement[];
}

export interface Ingredient {
    id: string;
    name: string;
    stock: number; // in grams, ml, or units
    unitOfMeasure: 'g' | 'kg' | 'ml' | 'l' | 'un';
    cost: number; // cost per unit of measure (e.g., cost per gram)
}

export interface RecipeItem {
    ingredientId: string;
    quantity: number; // in the ingredient's unit of measure
}

export interface Recipe {
    id: string;
    productId: string;
    items: RecipeItem[];
    // totalCost is calculated on the fly
}
    
