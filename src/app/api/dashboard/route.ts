import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { getDashboardKPIs, getSalesOverTime } from "@/lib/db/queries/analytics";
import { getRecentOrdersByTenant } from "@/lib/db/queries/orders";
import { getRRPPPerformanceByTenant } from "@/lib/db/queries/rrpp";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  return NextResponse.json({
    kpis,
    salesOverTime,
    recentOrders,
    rrppRanking,
    currency,
  });
}
