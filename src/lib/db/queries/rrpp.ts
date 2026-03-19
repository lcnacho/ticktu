import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  rrppPromoters,
  rrppLinks,
  type RRPPPromoter,
  type RRPPLink,
} from "@/lib/db/schema/rrpp";
import { orders } from "@/lib/db/schema/orders";
import { randomBytes } from "crypto";

export async function getPromotersByTenant(
  tenantId: string,
): Promise<RRPPPromoter[]> {
  return db
    .select()
    .from(rrppPromoters)
    .where(eq(rrppPromoters.tenantId, tenantId))
    .orderBy(asc(rrppPromoters.name));
}

export async function searchPromotersByTenant(
  tenantId: string,
  query: string,
): Promise<RRPPPromoter[]> {
  return db
    .select()
    .from(rrppPromoters)
    .where(
      and(
        eq(rrppPromoters.tenantId, tenantId),
        ilike(rrppPromoters.name, `%${query}%`),
      ),
    )
    .orderBy(asc(rrppPromoters.name));
}

export async function getPromoterById(
  tenantId: string,
  promoterId: string,
): Promise<RRPPPromoter | null> {
  const [promoter] = await db
    .select()
    .from(rrppPromoters)
    .where(
      and(
        eq(rrppPromoters.tenantId, tenantId),
        eq(rrppPromoters.id, promoterId),
      ),
    )
    .limit(1);
  return promoter ?? null;
}

export async function createPromoter(data: {
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
}): Promise<RRPPPromoter> {
  const [promoter] = await db
    .insert(rrppPromoters)
    .values(data)
    .returning();
  return promoter;
}

export async function updatePromoter(
  tenantId: string,
  promoterId: string,
  data: Partial<Pick<RRPPPromoter, "name" | "phone" | "email" | "isActive">>,
): Promise<RRPPPromoter | null> {
  const [updated] = await db
    .update(rrppPromoters)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(rrppPromoters.tenantId, tenantId),
        eq(rrppPromoters.id, promoterId),
      ),
    )
    .returning();
  return updated ?? null;
}

export async function getLinksByEvent(
  tenantId: string,
  eventId: string,
): Promise<RRPPLink[]> {
  return db
    .select()
    .from(rrppLinks)
    .where(
      and(eq(rrppLinks.tenantId, tenantId), eq(rrppLinks.eventId, eventId)),
    )
    .orderBy(desc(rrppLinks.createdAt));
}

export async function getLinkByCode(
  code: string,
): Promise<RRPPLink | null> {
  const [link] = await db
    .select()
    .from(rrppLinks)
    .where(and(eq(rrppLinks.code, code), eq(rrppLinks.isActive, true)))
    .limit(1);
  return link ?? null;
}

export async function getLinkByEventAndPromoter(
  tenantId: string,
  eventId: string,
  promoterId: string,
): Promise<RRPPLink | null> {
  const [link] = await db
    .select()
    .from(rrppLinks)
    .where(
      and(
        eq(rrppLinks.tenantId, tenantId),
        eq(rrppLinks.eventId, eventId),
        eq(rrppLinks.promoterId, promoterId),
      ),
    )
    .limit(1);
  return link ?? null;
}

function generateLinkCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

export async function createRRPPLink(data: {
  tenantId: string;
  eventId: string;
  promoterId: string;
}): Promise<RRPPLink> {
  const code = generateLinkCode();
  const [link] = await db
    .insert(rrppLinks)
    .values({ ...data, code })
    .returning();
  return link;
}

export async function deactivateRRPPLink(
  tenantId: string,
  linkId: string,
): Promise<RRPPLink | null> {
  const [updated] = await db
    .update(rrppLinks)
    .set({ isActive: false })
    .where(and(eq(rrppLinks.tenantId, tenantId), eq(rrppLinks.id, linkId)))
    .returning();
  return updated ?? null;
}

export async function getRRPPPerformanceByTenant(
  tenantId: string,
): Promise<
  { promoterId: string; promoterName: string; ticketsSold: number; revenue: number }[]
> {
  const result = await db
    .select({
      promoterId: rrppPromoters.id,
      promoterName: rrppPromoters.name,
      ticketsSold: sql<number>`coalesce(sum(${orders.totalAmount})::int / nullif(avg(${orders.totalAmount})::int, 0), 0)`,
      revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
    })
    .from(rrppPromoters)
    .leftJoin(rrppLinks, eq(rrppLinks.promoterId, rrppPromoters.id))
    .leftJoin(
      orders,
      and(eq(orders.rrppLinkId, rrppLinks.id), eq(orders.status, "paid")),
    )
    .where(eq(rrppPromoters.tenantId, tenantId))
    .groupBy(rrppPromoters.id, rrppPromoters.name)
    .orderBy(sql`coalesce(sum(${orders.totalAmount}), 0) desc`);

  return result;
}

export async function getRRPPPerformanceByEvent(
  tenantId: string,
  eventId: string,
): Promise<
  { promoterId: string; promoterName: string; ticketsSold: number; revenue: number; linkCode: string }[]
> {
  const result = await db
    .select({
      promoterId: rrppPromoters.id,
      promoterName: rrppPromoters.name,
      ticketsSold: sql<number>`count(${orders.id})::int`,
      revenue: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
      linkCode: rrppLinks.code,
    })
    .from(rrppLinks)
    .innerJoin(rrppPromoters, eq(rrppPromoters.id, rrppLinks.promoterId))
    .leftJoin(
      orders,
      and(eq(orders.rrppLinkId, rrppLinks.id), eq(orders.status, "paid")),
    )
    .where(
      and(eq(rrppLinks.tenantId, tenantId), eq(rrppLinks.eventId, eventId)),
    )
    .groupBy(rrppPromoters.id, rrppPromoters.name, rrppLinks.code)
    .orderBy(sql`count(${orders.id}) desc`);

  return result;
}
