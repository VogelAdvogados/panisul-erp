
'use client';
import { useEffect } from 'react';
import { ClientList } from "./components/client-list";
import { useSearchParams } from 'next/navigation';

export default function ClientesPage() {
  // This is a workaround to ensure client-list can use searchParams
  // and be a client component while this page remains a server component initially.
  // We will pass the search param as a prop.
  const searchParams = useSearchParams();
  const customerToOpen = searchParams.get('open');
  
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <ClientList customerToOpen={customerToOpen}/>
    </div>
  );
}
