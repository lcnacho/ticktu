import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  eventAccessCodes,
  type EventAccessCode,
} from "@/lib/db/schema/event-access-codes";
import { scans, type Scan } from "@/lib/db/schema/scans";
import { tickets } from "@/lib/db/schema/tickets";
import { ticketTypes } from "@/lib/db/schema/ticket-types";
import { randomBytes } from "crypto";

export async function validateEventCode(
  code: string,
): Promise<EventAccessCode | null> {
  const [result] = await db
    .select()
    .from(eventAccessCodes)
    .where(
      and(
        eq(eventAccessCodes.code, code),
        eq(eventAccessCodes.isActive, true),
        sql`(${eventAccessCodes.expiresAt} IS NULL OR ${eventAccessCodes.expiresAt} > now())`,
      ),
    )
    .limit(1);
  return result ?? null;
}

export async function createEventAccessCode(data: {
  tenantId: string;
  eventId: string;
  expiresAt?: Date;
}): Promise<EventAccessCode> {
  const code = randomBytes(4).toString("hex").toUpperCase();
  const [result] = await db
    .insert(eventAccessCodes)
    .values({ ...data, code })
    .returning();
  return result;
}

export async function getEventAccessCodes(
  tenantId: string,
  eventId: string,
): Promise<EventAccessCode[]> {
  return db
    .select()
    .from(eventAccessCodes)
    .where(
      and(
        eq(eventAccessCodes.tenantId, tenantId),
        eq(eventAccessCodes.eventId, eventId),
      ),
    )
    .orderBy(desc(eventAccessCodes.createdAt));
}

export async function deactivateEventAccessCode(
  tenantId: string,
  codeId: string,
): Promise<void> {
  await db
    .update(eventAccessCodes)
    .set({ isActive: false })
    .where(
      and(
        eq(eventAccessCodes.tenantId, tenantId),
        eq(eventAccessCodes.id, codeId),
      ),
    );
}

export async function getTicketByQrHash(
  tenantId: string,
  qrHash: string,
  eventId: string,
): Promise<{
  ticketId: string;
  holderName: string;
  ticketType: string;
  status: string;
} | null> {
  const [result] = await db
    .select({
      ticketId: tickets.id,
      holderName: tickets.holderName,
      ticketType: ticketTypes.name,
      status: tickets.status,
    })
    .from(tickets)
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        eq(tickets.qrHash, qrHash),
        eq(tickets.eventId, eventId),
      ),
    )
    .limit(1);
  return result ?? null;
}

export async function markTicketAsUsed(
  tenantId: string,
  ticketId: string,
): Promise<void> {
  await db
    .update(tickets)
    .set({ status: "used", updatedAt: new Date() })
    .where(and(eq(tickets.tenantId, tenantId), eq(tickets.id, ticketId)));
}

export async function createScan(data: {
  tenantId: string;
  eventId: string;
  ticketId?: string;
  qrHash: string;
  status: "valid" | "invalid" | "duplicate" | "conflict";
  operatorName: string;
  deviceId: string;
  scannedAt: Date;
  syncedAt?: Date;
  conflictReason?: string;
}): Promise<Scan> {
  const [scan] = await db.insert(scans).values(data).returning();
  return scan;
}

export async function getScansByEvent(
  tenantId: string,
  eventId: string,
): Promise<Scan[]> {
  return db
    .select()
    .from(scans)
    .where(
      and(eq(scans.tenantId, tenantId), eq(scans.eventId, eventId)),
    )
    .orderBy(desc(scans.scannedAt));
}

export async function getCheckinStats(
  tenantId: string,
  eventId: string,
): Promise<{ total: number; scanned: number }> {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(
      and(eq(tickets.tenantId, tenantId), eq(tickets.eventId, eventId)),
    );

  const [scannedResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tickets)
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        eq(tickets.eventId, eventId),
        eq(tickets.status, "used"),
      ),
    );

  return {
    total: totalResult?.count ?? 0,
    scanned: scannedResult?.count ?? 0,
  };
}

export async function getTicketManifest(
  tenantId: string,
  eventId: string,
) {
  return db
    .select({
      qrHash: tickets.qrHash,
      status: tickets.status,
      ticketType: ticketTypes.name,
      holderName: tickets.holderName,
    })
    .from(tickets)
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .where(
      and(eq(tickets.tenantId, tenantId), eq(tickets.eventId, eventId)),
    );
}
