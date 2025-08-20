
import type { ExpenseCategory } from './types';

interface CategoryDetails {
    label: string;
    color: string;
}

export const expenseCategories: Record<ExpenseCategory, CategoryDetails> = {
    // Revenue
    vendas: { label: 'Vendas', color: 'hsl(var(--chart-1))' },

    // Expenses
    insumos: { label: 'Insumos/Fornecedores', color: 'hsl(var(--chart-2))' },
    salarios: { label: 'Folha de Pagamento', color: 'hsl(var(--chart-3))' },
    adiantamentos: { label: 'Adiantamentos', color: 'hsl(var(--chart-3))' },
    contas_consumo: { label: 'Contas de Consumo', color: 'hsl(var(--chart-4))' },
    servicos_terceiros: { label: 'Serviços de Terceiros', color: 'hsl(var(--chart-5))' },
    manutencao: { label: 'Manutenção e Reparos', color: 'hsl(var(--accent-foreground))' },
    marketing: { label: 'Marketing e Publicidade', color: 'hsl(var(--accent-foreground))' },
    emprestimos: { label: 'Empréstimos/Financiamentos', color: 'hsl(var(--accent-foreground))' },
    impostos: { label: 'Impostos e Taxas', color: 'hsl(var(--muted-foreground))' },
    seguros: { label: 'Seguros', color: 'hsl(var(--muted-foreground))' },
    outros: { label: 'Outros', color: 'hsl(var(--muted-foreground))' },
}
