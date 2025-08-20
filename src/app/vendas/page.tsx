
import { redirect } from 'next/navigation';

export default function VendasPage() {
  // Redirect to the new Operations page which is the main hub now.
  redirect('/operacoes');
}
