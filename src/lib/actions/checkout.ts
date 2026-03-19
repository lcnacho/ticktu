"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import { getProducerBySlug } from "@/lib/db/queries/producers";
import { getTicketTypeById } from "@/lib/db/queries/ticket-types";
import { atomicIncrementSoldCount } from "@/lib/db/queries/orders";
import { getLinkByCode } from "@/lib/db/queries/rrpp";
import { mercadopagoAdapter } from "@/lib/payments/mercadopago-client";
import { calculateServiceFee } from "@/lib/utils/money";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { orderItems } from "@/lib/db/schema/order-items";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

type CheckoutItem = {
  ticketTypeId: string;
  holderName: string;
  holderEmail: string;
};

export async function createCheckoutAction(formData: {
  producerSlug: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  items: CheckoutItem[];
  rrppRef?: string;
}): Promise<ActionResult<{ redirectUrl: string; orderId: string }>> {
  // 1. Resolve producer (no auth needed for buyer checkout)
  const producer = await getProducerBySlug(formData.producerSlug);
  if (!producer) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Producer not found", 404),
    };
  }

  const tenantId = producer.tenantId;

  // 2. Validate items
  if (!formData.items.length) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "Selecciona al menos una entrada",
        400,
      ),
    };
  }
  if (!formData.buyerName?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El nombre es obligatorio",
        400,
        "buyerName",
      ),
    };
  }
  if (!formData.buyerEmail?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El email es obligatorio",
        400,
        "buyerEmail",
      ),
    };
  }

  // 3. Calculate totals and validate capacity
  let totalAmount = 0;
  let totalFee = 0;
  const orderItemsData: {
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    feeAmount: number;
    holderName: string;
    holderEmail: string;
  }[] = [];

  // Group items by ticket type for capacity check
  const itemsByType = new Map<string, CheckoutItem[]>();
  for (const item of formData.items) {
    const existing = itemsByType.get(item.ticketTypeId) ?? [];
    existing.push(item);
    itemsByType.set(item.ticketTypeId, existing);
  }

  // Pre-validate ticket types before transaction
  const ticketTypeMap = new Map<string, Awaited<ReturnType<typeof getTicketTypeById>>>();
  for (const [ticketTypeId] of itemsByType) {
    const tt = await getTicketTypeById(tenantId, ticketTypeId);
    if (!tt || !tt.isActive) {
      return {
        success: false,
        error: createAppError(
          "NOT_FOUND",
          "Tipo de entrada no disponible",
          400,
        ),
      };
    }
    ticketTypeMap.set(ticketTypeId, tt);
  }

  // 4. Resolve RRPP attribution (sanitize rrppRef — alphanumeric only)
  let rrppLinkId: string | undefined;
  const sanitizedRrppRef = formData.rrppRef?.replace(/[^a-zA-Z0-9_-]/g, "");
  if (sanitizedRrppRef) {
    const link = await getLinkByCode(sanitizedRrppRef);
    if (link && link.tenantId === tenantId) {
      rrppLinkId = link.id;
    }
  }

  // 5. Create order inside transaction — capacity increment + order + items are atomic
  const order = await db.transaction(async (tx) => {
    for (const [ticketTypeId, items] of itemsByType) {
      const tt = ticketTypeMap.get(ticketTypeId)!;

      // Atomic capacity check — inside transaction
      const success = await atomicIncrementSoldCount(
        tenantId,
        ticketTypeId,
        items.length,
        tx,
      );
      if (!success) {
        throw new Error("CAPACITY_EXCEEDED");
      }

      for (const item of items) {
        const fee = calculateServiceFee(
          tt.price,
          producer.feePercentage,
          producer.feeFixed,
        );
        totalAmount += tt.price + fee;
        totalFee += fee;

        orderItemsData.push({
          ticketTypeId,
          quantity: 1,
          unitPrice: tt.price,
          feeAmount: fee,
          holderName: item.holderName,
          holderEmail: item.holderEmail,
        });
      }
    }

    // Create order
    const [newOrder] = await tx.insert(orders).values({
      tenantId,
      eventId: formData.eventId,
      buyerName: formData.buyerName.trim(),
      buyerEmail: formData.buyerEmail.trim(),
      paymentMethod: "mercadopago",
      totalAmount,
      feeAmount: totalFee,
      currency: producer.currency,
      rrppLinkId,
    }).returning();

    // Create order items
    await tx.insert(orderItems).values(
      orderItemsData.map((item) => ({
        ...item,
        tenantId,
        orderId: newOrder.id,
      })),
    );

    return newOrder;
  }).catch((err: Error) => {
    if (err.message === "CAPACITY_EXCEEDED") return null;
    throw err;
  });

  if (!order) {
    return {
      success: false,
      error: createAppError(
        "CAPACITY_EXCEEDED",
        "Entradas agotadas para este tipo",
        400,
      ),
    };
  }

  // 7. Create MercadoPago preference
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ticktu.com";
  let baseUrl: string;
  try {
    const parsed = new URL(rawBaseUrl);
    baseUrl = parsed.origin;
  } catch {
    baseUrl = "https://ticktu.com";
  }
  const callbackBase = `${baseUrl}/${formData.producerSlug}/events/${formData.eventId}`;

  const preference = await mercadopagoAdapter.createPreference({
    orderId: order.id,
    buyerEmail: formData.buyerEmail,
    externalReference: `${order.id}${rrppLinkId ? `|${sanitizedRrppRef}` : ""}`,
    items: orderItemsData.map((item) => ({
      title: `Entrada - ${item.holderName}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice + item.feeAmount,
      currency: producer.currency,
    })),
    callbackUrls: {
      success: `${callbackBase}/confirmation?orderId=${order.id}`,
      failure: `${callbackBase}/checkout?orderId=${order.id}&status=failure`,
      pending: `${callbackBase}/confirmation?orderId=${order.id}&status=pending`,
    },
  });

  // Update order with preference ID
  const { updateOrderStatus } = await import("@/lib/db/queries/orders");
  await updateOrderStatus(tenantId, order.id, {
    mercadopagoPreferenceId: preference.preferenceId,
  });

  // 8. After
  after(async () => {
    revalidateTag(`event-${formData.eventId}`, "default");
  });

  return {
    success: true,
    data: { redirectUrl: preference.initPoint, orderId: order.id },
  };
}
