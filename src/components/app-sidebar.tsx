
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  ShoppingCart,
  Users,
  Archive,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Settings,
  Repeat,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, description: "Visão geral do negócio" },
    { href: '/operacoes', label: 'Painel do Dia', icon: ClipboardList, description: "Operações diárias" },
    { href: '/vendas/pdv', label: 'Vendas (PDV)', icon: ShoppingBag, description: "Ponto de Venda" },
    { href: '/financeiro', label: 'Financeiro', icon: Wallet, description: "Contas e fluxo de caixa" },
    { href: '/compras', label: 'Compras', icon: ShoppingCart, description: "Importar XML/PDF" },
    { href: '/cadastros', label: 'Cadastros', icon: Archive, description: "Produtos e insumos" },
    { href: '/clientes', label: 'Clientes', icon: Users, description: "Cadastro e histórico" },
    { href: '/trocas', label: 'Trocas', icon: Repeat, description: "Registro de trocas" },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3, description: "Análises gerenciais" },
    
];

export function AppSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 shadow-lg',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-background border rounded-full p-1.5 text-foreground shadow-md hover:shadow-lg transition-all z-10"
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="flex items-center justify-center p-4 border-b border-sidebar-border h-20">
            <div className={`bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-2 transition-all ${isCollapsed ? '' : 'mr-3'}`}>
                <ChefHat className="w-6 h-6 text-white" />
            </div>
          {!isCollapsed && (
             <div className="ml-2">
                <h1 className="text-xl font-bold text-sidebar-foreground">Panisul</h1>
                <p className="text-xs text-sidebar-foreground/70">Sistema de Gestão</p>
             </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href} className="list-none">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={item.href} className={cn(
                                'flex items-center p-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group',
                                isActive && 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-inner',
                                isCollapsed ? 'justify-center' : 'justify-start'
                            )}>
                            
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="ml-4 font-medium block">{item.label}</span>}
                            
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" align="center" className="bg-popover text-popover-foreground">
                            <p className="font-bold">{item.label}</p>
                            <p className="text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
              </li>
            );
          })}
        </nav>
        
      </aside>
    </TooltipProvider>
  );
}
