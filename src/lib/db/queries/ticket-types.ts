import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { ticketTypes, type TicketType } from "@/lib/db/schema/ticket-types";

export async function getTicketTypesByEvent(
  tenantId: string,
  eventId: string,
): Promise<TicketType[]> {
  return db
    .select()
    .from(ticketTypes)
    .where(
      and(eq(ticketTypes.tenantId, tenantId), eq(ticketTypes.eventId, eventId)),
    )
    .orderBy(asc(ticketTypes.sortOrder), asc(ticketTypes.createdAt));
}

export async function getTicketTypeById(
  tenantId: string,
  ticketTypeId: string,
): Promise<TicketType | null> {
  const [tt] = await db
    .select()
    .from(ticketTypes)
    .where(
      and(eq(ticketTypes.tenantId, tenantId), eq(ticketTypes.id, ticketTypeId)),
    )
    .limit(1);
  return tt ?? null;
}

export async function getActiveTicketTypesByEvent(
  tenantId: string,
  eventId: string,
): Promise<TicketType[]> {
  return db
    .select()
    .from(ticketTypes)
    .where(
      and(
        eq(ticketTypes.tenantId, tenantId),
        eq(ticketTypes.eventId, eventId),
        eq(ticketTypes.isActive, true),
      ),
    )
    .orderBy(asc(ticketTypes.sortOrder), asc(ticketTypes.createdAt));
}

export async function createTicketType(data: {
  tenantId: string;
  eventId: string;
  name: string;
  description?: string;
  price: number;
  maxCapacity: number;
  sortOrder?: number;
}): Promise<TicketType> {
  const [tt] = await db.insert(ticketTypes).values(data).returning();
  return tt;
}

export async function updateTicketType(
  tenantId: string,
  ticketTypeId: string,
  data: Partial<
    Omit<TicketType, "id" | "tenantId" | "eventId" | "createdAt" | "updatedAt">
  >,
): Promise<TicketType | null> {
  const [updated] = await db
    .update(ticketTypes)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(ticketTypes.tenantId, tenantId), eq(ticketTypes.id, ticketTypeId)),
    )
    .returning();
  return updated ?? null;
}
