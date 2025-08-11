
'use client';

import type { Metadata } from "next";
import { useState } from "react";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

// Metadata cannot be exported from a client component.
// We can keep it here, but it won't be used unless we move it to a server component.
// For the purpose of this example, we'll leave it, but in a real app
// you'd handle this differently, perhaps with a separate layout file.
// export const metadata: Metadata = {
//   title: "Sistema de Gestão Integrado Panisul",
//   description: "Sistema de Gestão Integrado para Panisul",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="pt-BR">
      <head>
        <title>Sistema de Gestão Integrado Panisul</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <div className="flex min-h-screen">
          <AppSidebar 
            isCollapsed={isCollapsed} 
            setIsCollapsed={setIsCollapsed} 
          />
          <main className={cn("flex-1 transition-all duration-300", {
            "ml-72": !isCollapsed,
            "ml-20": isCollapsed,
          })}>
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
