import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { expenses, type Expense, type ExpenseCategory } from "@/lib/db/schema/expenses";

export async function getExpensesByTenant(
  tenantId: string,
): Promise<Expense[]> {
  return db
    .select()
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))
    .orderBy(desc(expenses.expenseDate));
}

export async function getExpensesByEvent(
  tenantId: string,
  eventId: string,
): Promise<Expense[]> {
  return db
    .select()
    .from(expenses)
    .where(
      and(eq(expenses.tenantId, tenantId), eq(expenses.eventId, eventId)),
    )
    .orderBy(desc(expenses.expenseDate));
}

export async function getExpenseById(
  tenantId: string,
  expenseId: string,
): Promise<Expense | null> {
  const [expense] = await db
    .select()
    .from(expenses)
    .where(
      and(eq(expenses.tenantId, tenantId), eq(expenses.id, expenseId)),
    )
    .limit(1);
  return expense ?? null;
}

export async function createExpense(data: {
  tenantId: string;
  eventId?: string;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  currency: string;
  expenseDate: Date;
}): Promise<Expense> {
  const [expense] = await db.insert(expenses).values(data).returning();
  return expense;
}

export async function updateExpense(
  tenantId: string,
  expenseId: string,
  data: Partial<
    Pick<Expense, "category" | "description" | "amountCents" | "eventId" | "expenseDate">
  >,
): Promise<Expense | null> {
  const [updated] = await db
    .update(expenses)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(expenses.tenantId, tenantId), eq(expenses.id, expenseId)),
    )
    .returning();
  return updated ?? null;
}

export async function deleteExpense(
  tenantId: string,
  expenseId: string,
): Promise<boolean> {
  const result = await db
    .delete(expenses)
    .where(
      and(eq(expenses.tenantId, tenantId), eq(expenses.id, expenseId)),
    )
    .returning({ id: expenses.id });
  return result.length > 0;
}

export async function getTotalExpensesByTenant(
  tenantId: string,
): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)::int` })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId));
  return result?.total ?? 0;
}

export async function getTotalExpensesByEvent(
  tenantId: string,
  eventId: string,
): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)::int` })
    .from(expenses)
    .where(
      and(eq(expenses.tenantId, tenantId), eq(expenses.eventId, eventId)),
    );
  return result?.total ?? 0;
}

export async function getExpensesByCategory(
  tenantId: string,
): Promise<{ category: string; total: number }[]> {
  return db
    .select({
      category: expenses.category,
      total: sql<number>`sum(${expenses.amountCents})::int`,
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))
    .groupBy(expenses.category)
    .orderBy(sql`sum(${expenses.amountCents}) desc`);
}
