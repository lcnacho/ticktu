import { NextResponse, type NextRequest } from "next/server";
import {
  getTicketByQrHash,
  markTicketAsUsed,
  createScan,
} from "@/lib/db/queries/validation";
import { verifySessionToken } from "@/lib/validation/session-token";
import { z } from "zod/v4";

const scanBodySchema = z.object({
  qrHash: z.string().min(1),
  eventId: z.string().min(1),
  tenantId: z.string().min(1),
  operatorName: z.string().min(1),
  deviceId: z.string().min(1),
  scannedAt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Verify session token
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const raw = await request.json();
  const parsed = scanBodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const { qrHash, operatorName, deviceId, scannedAt } = parsed.data;
  // Use eventId and tenantId from the verified token, not from user input
  const { eventId, tenantId } = session;

  const ticket = await getTicketByQrHash(tenantId, qrHash, eventId);

  if (!ticket) {
    await createScan({
      tenantId,
      eventId,
      qrHash,
      status: "invalid",
      operatorName,
      deviceId,
      scannedAt: new Date(scannedAt || Date.now()),
      syncedAt: new Date(),
    });

    return NextResponse.json({ status: "invalid", reason: "No encontrado" });
  }

  if (ticket.status === "used") {
    await createScan({
      tenantId,
      eventId,
      ticketId: ticket.ticketId,
      qrHash,
      status: "duplicate",
      operatorName,
      deviceId,
      scannedAt: new Date(scannedAt || Date.now()),
      syncedAt: new Date(),
    });

    return NextResponse.json({
      status: "duplicate",
      reason: "Ya fue usado",
      holderName: ticket.holderName,
      ticketType: ticket.ticketType,
    });
  }

  if (ticket.status === "cancelled") {
    await createScan({
      tenantId,
      eventId,
      ticketId: ticket.ticketId,
      qrHash,
      status: "invalid",
      operatorName,
      deviceId,
      scannedAt: new Date(scannedAt || Date.now()),
      syncedAt: new Date(),
    });

    return NextResponse.json({
      status: "invalid",
      reason: "Ticket cancelado",
    });
  }

  await markTicketAsUsed(tenantId, ticket.ticketId);

  await createScan({
    tenantId,
    eventId,
    ticketId: ticket.ticketId,
    qrHash,
    status: "valid",
    operatorName,
    deviceId,
    scannedAt: new Date(scannedAt || Date.now()),
    syncedAt: new Date(),
  });

  return NextResponse.json({
    status: "valid",
    holderName: ticket.holderName,
    ticketType: ticket.ticketType,
  });
}
