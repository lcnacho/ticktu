import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { getCustomersByTenant } from "@/lib/db/queries/analytics";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";

async function CustomersContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ q?: string }>;
}) {
  const { q } = await searchParamsPromise;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) notFound();

  const producer = await getProducerByTenantId(tenantId);
  const currency = producer?.currency ?? "UYU";

  const customers = await getCustomersByTenant(tenantId, q);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-gray-500">Base de datos de compradores</p>
      </div>

      <CustomerTable customers={customers} currency={currency} />
    </>
  );
}

export default function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <CustomersContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
