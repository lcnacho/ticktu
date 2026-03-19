import { Suspense } from "react";
import { AdminTenantsClient } from "@/components/admin/admin-tenants-client";
import { getAllProducers } from "@/lib/db/queries/producers";

async function TenantsContent() {
  const producers = await getAllProducers();
  return <AdminTenantsClient producers={producers} />;
}

export default function AdminTenantsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Productoras</h1>
        <p className="text-sm text-gray-500">Gestion de productoras y tenants</p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-lg" />}>
        <TenantsContent />
      </Suspense>
    </div>
  );
}
