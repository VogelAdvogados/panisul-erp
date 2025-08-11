'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Archive,
  BarChart3,
  ClipboardList,
  Home,
  Repeat,
  ShoppingCart,
  Users,
  Wallet,
  Building,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/operacoes', label: 'Operações Diárias', icon: ClipboardList },
  { href: '/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/compras', label: 'Compras', icon: ShoppingCart },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/trocas', label: 'Trocas', icon: Repeat },
  { href: '/cadastros', label: 'Cadastros', icon: Archive },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Building className="w-8 h-8 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              Panisul
            </h2>
            <p className="text-xs text-sidebar-foreground/70">
              Sistema de Gestão
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className='p-4'>
        <Button variant="outline" className='w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
            Sair
        </Button>
      </SidebarFooter>
    </>
  );
}
