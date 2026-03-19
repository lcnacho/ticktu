import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { events, type Event, type EventStatus } from "@/lib/db/schema/events";

export async function getEventsByTenant(
  tenantId: string,
  status?: EventStatus,
): Promise<Event[]> {
  const conditions = [eq(events.tenantId, tenantId)];
  if (status) {
    conditions.push(eq(events.status, status));
  }
  return db
    .select()
    .from(events)
    .where(and(...conditions))
    .orderBy(desc(events.date));
}

export async function getEventById(
  tenantId: string,
  eventId: string,
): Promise<Event | null> {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.tenantId, tenantId), eq(events.id, eventId)))
    .limit(1);
  return event ?? null;
}

export async function getEventBySlug(
  tenantId: string,
  slug: string,
): Promise<Event | null> {
  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.tenantId, tenantId), eq(events.slug, slug)))
    .limit(1);
  return event ?? null;
}

export async function getPublishedEventsByTenant(
  tenantId: string,
): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(
      and(eq(events.tenantId, tenantId), eq(events.status, "published")),
    )
    .orderBy(desc(events.date));
}

export async function getPublishedEventBySlug(
  tenantId: string,
  eventSlug: string,
): Promise<Event | null> {
  const [event] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.tenantId, tenantId),
        eq(events.slug, eventSlug),
        eq(events.status, "published"),
      ),
    )
    .limit(1);
  return event ?? null;
}

export async function createEvent(data: {
  tenantId: string;
  name: string;
  slug: string;
  date: Date;
  venue: string;
  description?: string;
  imageUrl?: string;
}): Promise<Event> {
  const [event] = await db.insert(events).values(data).returning();
  return event;
}

export async function updateEvent(
  tenantId: string,
  eventId: string,
  data: Partial<
    Omit<Event, "id" | "tenantId" | "createdAt" | "updatedAt">
  >,
): Promise<Event | null> {
  const [updated] = await db
    .update(events)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(events.tenantId, tenantId), eq(events.id, eventId)))
    .returning();
  return updated ?? null;
}

export async function searchEventsByTenant(
  tenantId: string,
  query: string,
): Promise<Event[]> {
  const pattern = `%${query}%`;
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.tenantId, tenantId),
        or(ilike(events.name, pattern), ilike(events.venue, pattern)),
      ),
    )
    .orderBy(desc(events.date));
}
