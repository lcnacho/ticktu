import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { eq } from "drizzle-orm";
import { inngestClient } from "@/lib/inngest/client";
import { createHmac } from "crypto";
import { z } from "zod/v4";

const webhookBodySchema = z.object({
  type: z.string().optional(),
  topic: z.string().optional(),
  data: z.object({ id: z.union([z.string(), z.number()]) }).optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  // Parse x-signature header: "ts=...,v1=..."
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k.trim(), v.join("=")];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Extract data.id from body for the manifest
  const parsed = JSON.parse(body);
  const dataId = parsed.data?.id ?? "";

  // Build the manifest string per MercadoPago docs
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = createHmac("sha256", webhookSecret)
    .update(manifest)
    .digest("hex");

  return hmac === v1;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify webhook signature
  if (!verifyWebhookSignature(request, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawParsed = JSON.parse(rawBody);
  const parsed = webhookBodySchema.safeParse(rawParsed);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const body = parsed.data;

  // MercadoPago IPN sends topic + id
  if (body.type !== "payment" && body.topic !== "payment") {
    return NextResponse.json({ received: true });
  }

  const rawPaymentId = body.data?.id ?? body.id;
  if (!rawPaymentId) {
    return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
  }
  const paymentId = String(rawPaymentId);

  // Fetch payment details from MercadoPago
  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpAccessToken) {
    return NextResponse.json(
      { error: "Internal error" },
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
