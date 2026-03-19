import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import {
  getPromotersByTenant,
  getRRPPPerformanceByTenant,
} from "@/lib/db/queries/rrpp";
import { RRPPPromoterTable } from "@/components/dashboard/rrpp-promoter-table";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";
import { formatMoney } from "@/lib/utils/money";

async function RRPPContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) notFound();

  const producer = await getProducerByTenantId(tenantId);
  const currency = producer?.currency ?? "UYU";

  const [promoters, performance] = await Promise.all([
    getPromotersByTenant(tenantId),
    getRRPPPerformanceByTenant(tenantId),
  ]);

  // Merge performance data into promoters
  const promotersWithPerformance = promoters.map((p) => {
    const perf = performance.find((pp) => pp.promoterId === p.id);
    return {
      ...p,
      ticketsSold: perf?.ticketsSold ?? 0,
      revenue: perf?.revenue ?? 0,
    };
  });

  // Summary
  const totalSales = performance.reduce((sum, p) => sum + p.ticketsSold, 0);
  const totalRevenue = performance.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">RRPP</h1>
        <p className="text-sm text-gray-500">Gestion de promotores y atribucion de ventas</p>
      </div>

      {promoters.length > 0 && (
        <div className="mb-6 flex gap-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Promotores</p>
            <p className="text-2xl font-bold">{promoters.length}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Ventas totales</p>
            <p className="text-2xl font-bold">{totalSales}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Ingresos via RRPP</p>
            <p className="text-2xl font-bold">{formatMoney(totalRevenue, currency)}</p>
          </div>
        </div>
      )}

      <RRPPPromoterTable promoters={promotersWithPerformance} currency={currency} />
    </>
  );
}

export default function RRPPPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <RRPPContent />
      </Suspense>
    </div>
  );
}
