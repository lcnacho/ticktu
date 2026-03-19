import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { getDashboardKPIs, getSalesOverTime } from "@/lib/db/queries/analytics";
import { getRecentOrdersByTenant } from "@/lib/db/queries/orders";
import { getRRPPPerformanceByTenant } from "@/lib/db/queries/rrpp";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";

async function DashboardContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) notFound();

  const producer = await getProducerByTenantId(tenantId);
  const currency = producer?.currency ?? "UYU";

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [kpis, salesOverTime, recentOrders, rrppRanking] = await Promise.all([
    getDashboardKPIs(tenantId, thirtyDaysAgo, now),
    getSalesOverTime(tenantId, thirtyDaysAgo, now),
    getRecentOrdersByTenant(tenantId, 10),
    getRRPPPerformanceByTenant(tenantId),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Ultimos 30 dias</p>
      </div>

      <DashboardClient
        initialData={{
          kpis,
          salesOverTime,
          recentOrders,
          rrppRanking,
          currency,
        }}
        fetchUrl="/api/dashboard"
      />
    </>
  );
}

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
