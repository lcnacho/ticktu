import { NextResponse, type NextRequest } from "next/server";
import { getTicketManifest } from "@/lib/db/queries/validation";

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "eventId is required" },
      { status: 400 },
    );
  }

  const manifest = await getTicketManifest(eventId);

  return NextResponse.json(manifest);
}
