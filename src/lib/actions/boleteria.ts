"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import { getEventById } from "@/lib/db/queries/events";
import { getTicketTypeById } from "@/lib/db/queries/ticket-types";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { atomicIncrementSoldCount } from "@/lib/db/queries/orders";
import { generateQrPayload } from "@/lib/qr/generate";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { orderItems } from "@/lib/db/schema/order-items";
import { tickets } from "@/lib/db/schema/tickets";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function createBoleteriaOrderAction(formData: {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  buyerName: string;
  buyerEmail?: string;
  paymentMethod: "cash" | "transfer";
}): Promise<ActionResult<{ orderId: string }>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: createAppError("UNAUTHORIZED", "Not authenticated", 401) };
  }

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return { success: false, error: createAppError("FORBIDDEN", "No tenant access", 403) };
  }

  if (!formData.buyerName?.trim()) {
    return { success: false, error: createAppError("VALIDATION_ERROR", "El nombre es obligatorio", 400, "buyerName") };
  }

  const event = await getEventById(tenantId, formData.eventId);
  if (!event) {
    return { success: false, error: createAppError("NOT_FOUND", "Evento no encontrado", 404) };
  }

  const tt = await getTicketTypeById(tenantId, formData.ticketTypeId);
  if (!tt || !tt.isActive) {
    return { success: false, error: createAppError("NOT_FOUND", "Tipo de entrada no disponible", 400) };
  }

  // Atomic capacity check
  const success = await atomicIncrementSoldCount(tenantId, formData.ticketTypeId, formData.quantity);
  if (!success) {
    return { success: false, error: createAppError("CAPACITY_EXCEEDED", "Entradas agotadas", 400) };
  }

  const producer = await getProducerByTenantId(tenantId);
  const currency = producer?.currency ?? "UYU";

  const totalAmount = tt.price * formData.quantity;
  const buyerName = formData.buyerName.trim();
  const buyerEmail = formData.buyerEmail?.trim() || "boleteria@ticktu.com";

  const order = await db.transaction(async (tx) => {
    // Create order
    const [newOrder] = await tx.insert(orders).values({
      tenantId,
      eventId: formData.eventId,
      buyerName,
      buyerEmail,
      paymentMethod: formData.paymentMethod,
      totalAmount,
      feeAmount: 0,
      currency,
    }).returning();

    // Create order items (one per ticket)
    const itemValues = Array.from({ length: formData.quantity }, () => ({
      tenantId,
      orderId: newOrder.id,
      ticketTypeId: formData.ticketTypeId,
      quantity: 1,
      unitPrice: tt.price,
      feeAmount: 0,
      holderName: buyerName,
      holderEmail: buyerEmail,
    }));

    await tx.insert(orderItems).values(itemValues);

    // Create tickets with QR codes
    const ticketValues = itemValues.map(() => {
      const { qrCode, qrHash } = generateQrPayload();
      return {
        tenantId,
        eventId: formData.eventId,
        ticketTypeId: formData.ticketTypeId,
        holderName: buyerName,
        holderEmail: buyerEmail,
        isComplimentary: false,
        orderId: newOrder.id,
        qrCode,
        qrHash,
      };
    });

    await tx.insert(tickets).values(ticketValues);

    // Boleteria orders are paid immediately
    await tx.update(orders)
      .set({ status: "paid", updatedAt: new Date() })
      .where(and(eq(orders.tenantId, tenantId), eq(orders.id, newOrder.id)));

    return newOrder;
  });

  after(async () => {
    revalidateTag(`event-${formData.eventId}`, "default");
  });

  return { success: true, data: { orderId: order.id } };
}
