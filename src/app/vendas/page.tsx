
import { redirect } from 'next/navigation';

export default function VendasPage() {
  // Redirect to the new Operations page
  redirect('/operacoes?action=vender');
}
