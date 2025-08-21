
import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google';
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sistema de Gestão Integrado Panisul",
  description: "Sistema de Gestão Integrado para Panisul",
};

// Configura a fonte PT Sans, definindo-a como uma variável CSS (--font-sans)
// para ser consumida pelo Tailwind CSS.
const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-sans', // Chave para a integração com o Tailwind
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      {/* Aplica a variável da fonte ao corpo do HTML, tornando-a disponível globalmente */}
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          ptSans.variable 
        )}>
        <div className="flex min-h-screen">
          <AppSidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
