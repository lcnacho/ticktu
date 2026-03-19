import { NextResponse, type NextRequest } from "next/server";
import { validateEventCode } from "@/lib/db/queries/validation";
import { db } from "@/lib/db/index";
import { events } from "@/lib/db/schema/events";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { code, operatorName } = await request.json();

  if (!code || !operatorName) {
    return NextResponse.json(
      { error: "Code and operator name required" },
      { status: 400 },
    );
  }

  const accessCode = await validateEventCode(code);
  if (!accessCode) {
    return NextResponse.json(
      { error: "Invalid access code" },
      { status: 401 },
    );
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, accessCode.eventId))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    eventId: event.id,
    eventName: event.name,
    tenantId: accessCode.tenantId,
    operatorName,
  });
}
