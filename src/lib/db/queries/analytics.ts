import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { orderItems } from "@/lib/db/schema/order-items";
import { events } from "@/lib/db/schema/events";
import { expenses } from "@/lib/db/schema/expenses";
import { ticketTypes } from "@/lib/db/schema/ticket-types";
import { tickets } from "@/lib/db/schema/tickets";

export async function getDashboardKPIs(
  tenantId: string,
  from: Date,
  to: Date,
) {
  const dateFilter = and(
    eq(orders.tenantId, tenantId),
    eq(orders.status, "paid"),
    gte(orders.createdAt, from),
    lte(orders.createdAt, to),
  );

  const [revenueResult] = await db
    .select({
      ticketsSold: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
    })
    .from(orders)
    .where(dateFilter);

  const [expenseResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)::int`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.tenantId, tenantId),
        gte(expenses.expenseDate, from),
        lte(expenses.expenseDate, to),
      ),
    );

  const [activeEventsResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(events)
    .where(
      and(eq(events.tenantId, tenantId), eq(events.status, "published")),
    );

  const ticketsSold = revenueResult?.ticketsSold ?? 0;
  const revenue = revenueResult?.revenue ?? 0;
  const expensesTotal = expenseResult?.total ?? 0;
  const activeEvents = activeEventsResult?.count ?? 0;

  return {
    ticketsSold,
    revenue,
    expenses: expensesTotal,
    balance: revenue - expensesTotal,
    activeEvents,
  };
}

export async function getSalesOverTime(
  tenantId: string,
  from: Date,
  to: Date,
): Promise<{ date: string; count: number; revenue: number }[]> {
  return db
    .select({
      date: sql<string>`date_trunc('day', ${orders.createdAt})::date::text`,
      count: sql<number>`count(*)::int`,
      revenue: sql<number>`sum(${orders.totalAmount})::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.status, "paid"),
        gte(orders.createdAt, from),
        lte(orders.createdAt, to),
      ),
    )
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})`);
}

export async function getEventSettlement(
  tenantId: string,
  eventId: string,
) {
  const ticketBreakdown = await db
    .select({
      ticketTypeName: ticketTypes.name,
      unitPrice: ticketTypes.price,
      soldCount: ticketTypes.soldCount,
      maxCapacity: ticketTypes.maxCapacity,
    })
    .from(ticketTypes)
    .where(
      and(
        eq(ticketTypes.tenantId, tenantId),
        eq(ticketTypes.eventId, eventId),
      ),
    );

  const [complimentaryResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        eq(tickets.eventId, eventId),
        eq(tickets.isComplimentary, true),
      ),
    );

  const [orderTotals] = await db
    .select({
      grossRevenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
      totalFees: sql<number>`coalesce(sum(${orders.feeAmount}), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.eventId, eventId),
        eq(orders.status, "paid"),
      ),
    );

  return {
    ticketBreakdown,
    complimentaryCount: complimentaryResult?.count ?? 0,
    grossRevenue: orderTotals?.grossRevenue ?? 0,
    totalFees: orderTotals?.totalFees ?? 0,
    netEarnings: (orderTotals?.grossRevenue ?? 0) - (orderTotals?.totalFees ?? 0),
  };
}

export async function getCustomersByTenant(
  tenantId: string,
  search?: string,
): Promise<
  {
    buyerName: string;
    buyerEmail: string;
    totalPurchases: number;
    totalSpent: number;
    lastPurchase: Date;
  }[]
> {
  const conditions = [
    eq(orders.tenantId, tenantId),
    eq(orders.status, "paid"),
  ];

  if (search) {
    conditions.push(
      sql`(${orders.buyerName} ilike ${"%" + search + "%"} OR ${orders.buyerEmail} ilike ${"%" + search + "%"})`,
    );
  }

  return db
    .select({
      buyerName: sql<string>`max(${orders.buyerName})`,
      buyerEmail: orders.buyerEmail,
      totalPurchases: sql<number>`count(*)::int`,
      totalSpent: sql<number>`sum(${orders.totalAmount})::int`,
      lastPurchase: sql<Date>`max(${orders.createdAt})`,
    })
    .from(orders)
    .where(and(...conditions))
    .groupBy(orders.buyerEmail)
    .orderBy(sql`max(${orders.createdAt}) desc`);
}

export async function getFinanceSummary(tenantId: string) {
  const [revenueResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
    })
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.status, "paid")));

  const [expenseResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)::int`,
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId));

  const revenue = revenueResult?.total ?? 0;
  const totalExpenses = expenseResult?.total ?? 0;

  return {
    revenue,
    expenses: totalExpenses,
    balance: revenue - totalExpenses,
  };
}

export async function getPerEventFinanceSummary(
  tenantId: string,
  eventId: string,
) {
  const [revenueResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.tenantId, tenantId),
        eq(orders.eventId, eventId),
        eq(orders.status, "paid"),
      ),
    );

  const [expenseResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)::int`,
    })
    .from(expenses)
    .where(
      and(eq(expenses.tenantId, tenantId), eq(expenses.eventId, eventId)),
    );

  const revenue = revenueResult?.total ?? 0;
  const totalExpenses = expenseResult?.total ?? 0;

  return {
    revenue,
    expenses: totalExpenses,
    balance: revenue - totalExpenses,
  };
}
