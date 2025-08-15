

export interface Product {
    id: string;
    name: string;
    stock: number;
    produced: number;
    sold: number;
    price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ativo' | 'inativo';
  registeredAt: string;
  type: 'pessoa-juridica' | 'pessoa-fisica';
  doc: string;
  address: string;
  totalPurchasesValue: number;
  totalOrders: number;
  exchanges: number;
  lastPurchaseDate: string;
  pendingAmount: number;
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
    status: 'pending' | 'paid';
    type: MovementType;
    paymentDate?: string;
    category: ExpenseCategory;
    referenceId?: string; // e.g., purchaseId or saleId
    sourceAccount: SourceAccount;
}

export interface PurchaseItem {
    name: string;
    quantity: number;
    unitPrice: number;
}

export interface Purchase {
    id: string;
    invoiceNumber: string;
    supplierId: string;
    date: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    items: PurchaseItem[];
}

export interface SaleItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface Sale {
    id: string;
    customerId?: string;
    date: string;
    items: SaleItem[];
    totalAmount: number;
    paymentMethod: PaymentMethod;
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

export interface Exchange {
    id: string;
    date: string;
    customerId?: string;
    returnedProductId: string;
    newProductId: string;
    reason: string;
    returnedProductStatus: 'restock' | 'discard';
}
