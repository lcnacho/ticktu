import { AdminTenantsClient } from "@/components/admin/admin-tenants-client";
import { getAllProducers } from "@/lib/db/queries/producers";

export default async function AdminTenantsPage() {
  const producers = await getAllProducers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Productoras</h1>
        <p className="text-sm text-gray-500">Gestion de productoras y tenants</p>
      </div>

      <AdminTenantsClient producers={producers} />
    </div>
  );
}
