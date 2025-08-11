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
  Repeat,
  Archive,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Settings,
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
    { href: '/financeiro', label: 'Financeiro', icon: Wallet, description: "Contas e fluxo de caixa" },
    { href: '/compras', label: 'Compras', icon: ShoppingCart, description: "Importar XML/PDF" },
    { href: '/cadastros', label: 'Estoque', icon: Archive, description: "Produtos e insumos" },
    { href: '/clientes', label: 'Clientes', icon: Users, description: "Cadastro e histórico" },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3, description: "Análises gerenciais" },
    { href: '/configuracoes', label: 'Configurações', icon: Settings, description: "Sistema e cadastros" },
];

export function AppSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'bg-card border-r fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 shadow-lg',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        <div className="flex items-center justify-center p-4 border-b h-20">
            <div className={`bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg p-2 transition-all ${isCollapsed ? '' : 'mr-3'}`}>
                <ChefHat className="w-6 h-6 text-white" />
            </div>
          {!isCollapsed && (
             <div className="ml-2">
                <h1 className="text-xl font-bold text-foreground">Panisul</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
             </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href} className="list-none">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={item.href}>
                            <span className={cn(
                                'flex items-center p-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 group',
                                isActive && 'bg-primary/10 text-primary font-semibold border-r-4 border-primary',
                                isCollapsed ? 'justify-center' : 'justify-start'
                            )}>
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && 
                                    <div className="ml-4 flex-1">
                                        <span className="font-medium block">{item.label}</span>
                                        <span className="text-xs text-gray-500">{item.description}</span>
                                    </div>
                                }
                            </span>
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" align="center">
                            <p className="font-bold">{item.label}</p>
                            <p className="text-muted-foreground">{item.description}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
              </li>
            );
          })}
        </nav>
        
        <div className="p-2 border-t mt-auto">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-center p-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                {isCollapsed ? 
                    <ChevronRight className="h-6 w-6"/> : 
                    <ChevronLeft className="h-6 w-6" />
                }
            </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
