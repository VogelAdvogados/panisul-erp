
import type { ExpenseCategory } from './types';

interface CategoryDetails {
    label: string;
    color: string;
}

export const expenseCategories: Record<ExpenseCategory, CategoryDetails> = {
    insumos: { label: 'Insumos', color: 'hsl(var(--chart-1))' },
    salarios: { label: 'Salários', color: 'hsl(var(--chart-2))' },
    infraestrutura: { label: 'Infraestrutura', color: 'hsl(var(--chart-3))' },
    marketing: { label: 'Marketing', color: 'hsl(var(--chart-4))' },
    impostos: { label: 'Impostos', color: 'hsl(var(--chart-5))' },
    outros: { label: 'Outros', color: 'hsl(var(--muted-foreground))' },
}
