import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { getFinanceSummary } from "@/lib/db/queries/analytics";
import { getExpensesByTenant, getExpensesByCategory } from "@/lib/db/queries/expenses";
import { getEventsByTenant } from "@/lib/db/queries/events";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";
import { ExpensesByCategoryChart } from "@/components/dashboard/expenses-by-category-chart";
import { FinanzasClient } from "@/components/dashboard/finanzas-client";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";

async function FinanzasContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) notFound();

  const producer = await getProducerByTenantId(tenantId);
  if (!producer) notFound();
  const currency = producer.currency;

  const [finance, expenses, expensesByCategory, events] = await Promise.all([
    getFinanceSummary(tenantId),
    getExpensesByTenant(tenantId),
    getExpensesByCategory(tenantId),
    getEventsByTenant(tenantId),
  ]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finanzas</h1>
      </div>

      {/* Balance */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-2xl font-bold">{formatMoney(finance.revenue, currency)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Gastos</p>
          <p className="text-2xl font-bold">{formatMoney(finance.expenses, currency)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Balance</p>
          <p
            className={`text-2xl font-bold ${finance.balance >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatMoney(finance.balance, currency)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gastos donut */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold">Gastos por categoria</h2>
          <ExpensesByCategoryChart data={expensesByCategory} />
        </div>

        {/* Expense table + add button */}
        <FinanzasClient expenses={expenses} events={events} currency={currency} />
      </div>
    </>
  );
}

export default function FinanzasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <FinanzasContent />
      </Suspense>
    </div>
  );
}
