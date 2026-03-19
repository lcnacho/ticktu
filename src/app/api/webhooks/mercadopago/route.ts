import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { eq, and } from "drizzle-orm";
import { inngestClient } from "@/lib/inngest/client";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // MercadoPago IPN sends topic + id
  if (body.type !== "payment" && body.topic !== "payment") {
    return NextResponse.json({ received: true });
  }

  const paymentId = String(body.data?.id || body.id);
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
  }

  // Fetch payment details from MercadoPago
  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpAccessToken) {
    return NextResponse.json(
      { error: "Payment config missing" },
      { status: 500 },
    );
  }

  const paymentRes = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${mpAccessToken}` } },
  );

  if (!paymentRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 404 },
    );
  }

  const payment = await paymentRes.json();
  const externalReference = payment.external_reference;

  if (!externalReference) {
    return NextResponse.json(
      { error: "Missing external reference" },
      { status: 400 },
    );
  }

  // Extract orderId (format: "orderId" or "orderId|rrppRef")
  const orderId = externalReference.split("|")[0];

  // Find the order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Idempotency: skip if already paid
  if (order.status === "paid") {
    return NextResponse.json({ received: true, status: "already_processed" });
  }

  if (payment.status === "approved") {
    await db
      .update(orders)
      .set({
        status: "paid",
        mercadopagoPaymentId: paymentId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Dispatch ticket generation
    await inngestClient.send({
      name: "order/completed",
      data: { orderId, tenantId: order.tenantId },
    });
  } else if (
    payment.status === "rejected" ||
    payment.status === "cancelled"
  ) {
    await db
      .update(orders)
      .set({ status: "payment_failed", updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }

  return NextResponse.json({ received: true });
}
