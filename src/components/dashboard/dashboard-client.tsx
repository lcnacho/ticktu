"use client";

import { usePolling } from "@/lib/hooks/use-polling";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";
import type { Order } from "@/lib/db/schema/orders";

type DashboardData = {
  kpis: {
    ticketsSold: number;
    revenue: number;
    expenses: number;
    balance: number;
    activeEvents: number;
  };
  salesOverTime: { date: string; count: number; revenue: number }[];
  recentOrders: Order[];
  rrppRanking: { promoterId: string; promoterName: string; ticketsSold: number; revenue: number }[];
  currency: string;
};

type DashboardClientProps = {
  initialData: DashboardData;
  fetchUrl: string;
};

export function DashboardClient({ initialData, fetchUrl }: DashboardClientProps) {
  const { data } = usePolling<DashboardData>(
    () => fetch(fetchUrl).then((r) => r.json()),
    30000,
  );

  const d = data ?? initialData;

  return (
    <div className="space-y-6">
      <KPICards {...d.kpis} currency={d.currency} />

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-lg font-semibold">Ventas</h2>
        <SalesChart data={d.salesOverTime} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent sales */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Ventas recientes</h2>
          {d.recentOrders.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Sin ventas recientes</p>
          ) : (
            <div className="space-y-2">
              {d.recentOrders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{order.buyerName}</p>
                    <p className="text-xs text-gray-400">{order.buyerEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatMoney(order.totalAmount, d.currency)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDateTime(new Date(order.createdAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RRPP ranking */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Ranking RRPP</h2>
          {d.rrppRanking.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Sin datos de RRPP</p>
          ) : (
            <div className="space-y-2">
              {d.rrppRanking.map((row, i) => (
                <div
                  key={row.promoterId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{row.promoterName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{row.ticketsSold} ventas</p>
                    <p className="text-xs text-gray-400">
                      {formatMoney(row.revenue, d.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
