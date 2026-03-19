import { NextResponse, type NextRequest } from "next/server";
import { getTicketManifest } from "@/lib/db/queries/validation";
import { verifySessionToken } from "@/lib/validation/session-token";

export async function GET(request: NextRequest) {
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

  // Use eventId and tenantId from the verified token
  const manifest = await getTicketManifest(session.tenantId, session.eventId);

  return NextResponse.json(manifest);
}
