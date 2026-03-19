import { NextResponse, type NextRequest } from "next/server";
import {
  getTicketByQrHash,
  markTicketAsUsed,
  createScan,
} from "@/lib/db/queries/validation";

export async function POST(request: NextRequest) {
  const { qrHash, eventId, tenantId, operatorName, deviceId, scannedAt } =
    await request.json();

  if (!qrHash || !eventId || !tenantId || !operatorName || !deviceId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const ticket = await getTicketByQrHash(qrHash, eventId);

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

  await markTicketAsUsed(ticket.ticketId);

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
