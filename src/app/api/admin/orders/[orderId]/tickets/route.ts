import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/index";
import { tickets } from "@/lib/db/schema/tickets";
import { ticketTypes } from "@/lib/db/schema/ticket-types";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v4";

const paramsSchema = z.object({
  orderId: z.string().uuid(),
});

const querySchema = z.object({
  tenantId: z.string().uuid(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rawParams = await params;
  const parsedParams = paramsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }
  const { orderId } = parsedParams.data;

  const parsedQuery = querySchema.safeParse({
    tenantId: request.nextUrl.searchParams.get("tenantId"),
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Valid tenantId required" }, { status: 400 });
  }
  const { tenantId } = parsedQuery.data;

  const result = await db
    .select({
      id: tickets.id,
      holderName: tickets.holderName,
      holderEmail: tickets.holderEmail,
      status: tickets.status,
      ticketType: ticketTypes.name,
    })
    .from(tickets)
    .innerJoin(ticketTypes, eq(ticketTypes.id, tickets.ticketTypeId))
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        eq(tickets.orderId, orderId),
      ),
    );

  return NextResponse.json(result);
}
