
import { redirect } from 'next/navigation';

// This page is obsolete and redirects to the new unified "Cadastros" page.
export default function ClientesPage() {
  redirect('/cadastros?tab=clients');
}
