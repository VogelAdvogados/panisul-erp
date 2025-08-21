
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

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
