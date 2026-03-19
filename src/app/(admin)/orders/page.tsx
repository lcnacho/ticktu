import { AdminOrdersClient } from "@/components/admin/admin-orders-client";

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ordenes</h1>
        <p className="text-sm text-gray-500">Busqueda cross-tenant de ordenes</p>
      </div>

      <AdminOrdersClient />
    </div>
  );
}
