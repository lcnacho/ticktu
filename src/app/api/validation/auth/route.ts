import { NextResponse, type NextRequest } from "next/server";
import { validateEventCode } from "@/lib/db/queries/validation";
import { db } from "@/lib/db/index";
import { events } from "@/lib/db/schema/events";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { createSessionToken } from "@/lib/validation/session-token";

const authBodySchema = z.object({
  code: z.string().min(1),
  operatorName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const raw = await request.json();
  const parsed = authBodySchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Code and operator name required" },
      { status: 400 },
    );
  }

  const { code, operatorName } = parsed.data;

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

  const sessionToken = createSessionToken(event.id, accessCode.tenantId);

  return NextResponse.json({
    eventId: event.id,
    eventName: event.name,
    tenantId: accessCode.tenantId,
    operatorName,
    sessionToken,
  });
}
