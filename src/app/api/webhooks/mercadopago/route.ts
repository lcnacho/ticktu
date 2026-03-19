import { NextResponse } from "next/server";

export async function POST() {
  // TODO: Implement MercadoPago webhook handler (Epic 4)
  return NextResponse.json({ received: true });
}
