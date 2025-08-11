import { ClientList } from "./components/client-list";

export default function ClientesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <ClientList />
    </div>
  );
}
