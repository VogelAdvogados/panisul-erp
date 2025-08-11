
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
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/operacoes', label: 'Operações', icon: ClipboardList },
    { href: '/financeiro', label: 'Financeiro', icon: Wallet },
    { href: '/compras', label: 'Compras', icon: ShoppingCart },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/trocas', label: 'Trocas', icon: Repeat },
    { href: '/cadastros', label: 'Cadastros', icon: Archive },
    { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export function AppSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'bg-card border-r fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        <div className="flex items-center justify-center p-4 border-b h-16">
          <Building className={cn("text-primary transition-all", isCollapsed ? "h-8 w-8" : "h-6 w-6" )} />
          {!isCollapsed && (
             <div className="ml-2">
                <h1 className="text-xl font-bold text-foreground">Panisul</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
             </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href} className="list-none">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={item.href}>
                            <span className={cn(
                                'flex items-center p-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group',
                                isActive && 'bg-primary/10 text-primary font-semibold',
                                isCollapsed ? 'justify-center' : 'justify-start'
                            )}>
                                <Icon className="h-5 w-5 shrink-0" />
                                {!isCollapsed && <span className="ml-4">{item.label}</span>}
                            </span>
                        </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" align="center">
                            {item.label}
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
                className="w-full flex items-center p-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                {isCollapsed ? 
                    <ChevronRight className="h-6 w-6 mx-auto"/> : 
                    <>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="ml-4">Recolher</span>
                    </>
                }
            </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
