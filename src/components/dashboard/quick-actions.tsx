
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat, Receipt, Upload, Repeat, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const actions = [
    { label: 'Nova Venda', icon: ShoppingBag, href: '/pdv', color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Nova Produção', icon: ChefHat, href: '/operacoes', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Nova Despesa', icon: Receipt, href: '/financeiro/despesas/nova', color: 'bg-red-500 hover:bg-red-600' },
    { label: 'Importar Compra', icon: Upload, href: '/compras', color: 'bg-purple-500 hover:bg-purple-600' },
]

export function QuickActions() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Ações Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link href={action.href} key={action.label}>
                            <Button className={`w-full h-24 text-lg flex flex-col gap-2 ${action.color}`}>
                                <Icon className="h-8 w-8" />
                                <span>{action.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}
