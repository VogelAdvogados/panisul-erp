export interface Sale {
    name: string;
    total: number;
}

export interface OperationalSummaryItem {
    id: string;
    customer: string;
    description: string;
    type: 'Venda' | 'Recebimento' | 'Pagamento';
    amount: string;
}

export interface Product {
    id: string;
    name: string;
    stock: number;
    imageUrl: string;
    'data-ai-hint': string;
}
