import { and, asc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { batches, type Batch } from "@/lib/db/schema/batches";

export async function getBatchesByTicketType(
  tenantId: string,
  ticketTypeId: string,
): Promise<Batch[]> {
  return db
    .select()
    .from(batches)
    .where(
      and(
        eq(batches.tenantId, tenantId),
        eq(batches.ticketTypeId, ticketTypeId),
      ),
    )
    .orderBy(asc(batches.activatesAt));
}

export async function getAvailableBatches(
  tenantId: string,
  ticketTypeId: string,
): Promise<Batch[]> {
  return db
    .select()
    .from(batches)
    .where(
      and(
        eq(batches.tenantId, tenantId),
        eq(batches.ticketTypeId, ticketTypeId),
        eq(batches.isActive, true),
        lte(batches.activatesAt, sql`now()`),
        sql`${batches.soldCount} < ${batches.quantity}`,
      ),
    )
    .orderBy(asc(batches.activatesAt));
}

export async function getBatchById(
  tenantId: string,
  batchId: string,
): Promise<Batch | null> {
  const [batch] = await db
    .select()
    .from(batches)
    .where(and(eq(batches.tenantId, tenantId), eq(batches.id, batchId)))
    .limit(1);
  return batch ?? null;
}

export async function getTotalBatchQuantity(
  tenantId: string,
  ticketTypeId: string,
): Promise<number> {
  const result = await db
    .select({ total: sql<number>`coalesce(sum(${batches.quantity}), 0)` })
    .from(batches)
    .where(
      and(
        eq(batches.tenantId, tenantId),
        eq(batches.ticketTypeId, ticketTypeId),
      ),
    );
  return Number(result[0]?.total ?? 0);
}

export async function createBatch(data: {
  tenantId: string;
  ticketTypeId: string;
  name: string;
  quantity: number;
  activatesAt: Date;
}): Promise<Batch> {
  const [batch] = await db.insert(batches).values(data).returning();
  return batch;
}

export async function updateBatch(
  tenantId: string,
  batchId: string,
  data: Partial<
    Omit<Batch, "id" | "tenantId" | "ticketTypeId" | "createdAt" | "updatedAt">
  >,
): Promise<Batch | null> {
  const [updated] = await db
    .update(batches)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(batches.tenantId, tenantId), eq(batches.id, batchId)))
    .returning();
  return updated ?? null;
}
