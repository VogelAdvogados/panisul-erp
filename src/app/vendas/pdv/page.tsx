
import { redirect } from 'next/navigation';

// This page is obsolete and redirects to the new main PDV page.
export default function VendasPdvPage() {
  redirect('/pdv');
}
