import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Implement QR scan validation (Epic 6)
  return NextResponse.json({ valid: false, message: "Not implemented" });
}
