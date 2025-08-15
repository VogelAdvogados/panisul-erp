
import { redirect } from 'next/navigation';

// This page is obsolete and redirects to the new unified "Cadastros" page.
export default function EstoquePage() {
  redirect('/cadastros?tab=products');
}
