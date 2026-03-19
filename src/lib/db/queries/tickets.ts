import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { tickets, type Ticket } from "@/lib/db/schema/tickets";
import { ticketTypes } from "@/lib/db/schema/ticket-types";
import { sql } from "drizzle-orm";

export async function getComplimentaryTickets(
  tenantId: string,
  eventId: string,
): Promise<Ticket[]> {
  return db
    .select()
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        eq(tickets.eventId, eventId),
        eq(tickets.isComplimentary, true),
      ),
    )
    .orderBy(desc(tickets.createdAt));
}

export async function getComplimentaryCountByType(
  tenantId: string,
  eventId: string,
): Promise<{ ticketTypeId: string; count: number }[]> {
  return db
    .select({
      ticketTypeId: tickets.ticketTypeId,
      count: sql<number>`count(*)::int`,
    })
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        eq(tickets.eventId, eventId),
        eq(tickets.isComplimentary, true),
      ),
    )
    .groupBy(tickets.ticketTypeId);
}

export async function createTicket(data: {
  tenantId: string;
  eventId: string;
  ticketTypeId: string;
  holderName: string;
  holderEmail: string;
  isComplimentary: boolean;
  issuedBy?: string;
}): Promise<Ticket> {
  const [ticket] = await db.insert(tickets).values(data).returning();
  return ticket;
}

export async function incrementTicketTypeSoldCount(
  tenantId: string,
  ticketTypeId: string,
): Promise<void> {
  await db
    .update(ticketTypes)
    .set({
      soldCount: sql`${ticketTypes.soldCount} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(eq(ticketTypes.tenantId, tenantId), eq(ticketTypes.id, ticketTypeId)),
    );
}
