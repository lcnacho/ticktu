"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/proxy";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { tickets } from "@/lib/db/schema/tickets";
import { ticketReissuances } from "@/lib/db/schema/ticket-reissuances";
import { producers } from "@/lib/db/schema/producers";
import { mercadopagoAdapter } from "@/lib/payments/mercadopago-client";
import { generateQrPayload } from "@/lib/qr/generate";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { inngestClient } from "@/lib/inngest/client";
import { getProducerBySlugExists } from "@/lib/db/queries/producers";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

async function requireSuperAdmin(): Promise<
  { user: { id: string; app_metadata: Record<string, unknown> }; error?: never } |
  { error: AppError; user?: never }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: createAppError("UNAUTHORIZED", "Not authenticated", 401) };
  }
  if (user.app_metadata?.role !== "super_admin") {
    return {
      error: createAppError("FORBIDDEN", "Super admin access required", 403),
    };
  }
  return { user };
}

export async function searchOrdersAction(
  query: string,
): Promise<ActionResult<typeof orders.$inferSelect[]>> {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  const pattern = `%${query}%`;
  const results = await db
    .select()
    .from(orders)
    .where(
      or(
        ilike(orders.buyerName, pattern),
        ilike(orders.buyerEmail, pattern),
        ilike(orders.mercadopagoPaymentId, pattern),
      ),
    )
    .limit(50);

  return { success: true, data: results };
}

export async function processRefundAction(
  orderId: string,
  tenantId: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
    .limit(1);

  if (!order) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Order not found", 404),
    };
  }

  if (order.status === "refunded") {
    return {
      success: false,
      error: createAppError(
        "ORDER_ALREADY_REFUNDED",
        "This order has already been refunded",
        400,
      ),
    };
  }

  if (order.status !== "paid") {
    return {
      success: false,
      error: createAppError(
        "INVALID_STATE",
        "Only paid orders can be refunded",
        400,
      ),
    };
  }

  if (!order.mercadopagoPaymentId) {
    return {
      success: false,
      error: createAppError(
        "MISSING_PAYMENT",
        "No payment ID available for refund",
        400,
      ),
    };
  }

  try {
    await mercadopagoAdapter.processRefund({
      paymentId: order.mercadopagoPaymentId,
      amount: order.totalAmount,
    });
  } catch {
    return {
      success: false,
      error: createAppError(
        "REFUND_FAILED",
        "MercadoPago refund failed",
        500,
      ),
    };
  }

  // Update order status
  await db
    .update(orders)
    .set({ status: "refunded", refundStatus: "completed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Cancel all tickets
  await db
    .update(tickets)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(
      and(
        eq(tickets.tenantId, tenantId),
        sql`${tickets.orderId} = ${orderId}`,
      ),
    );

  return { success: true, data: { id: orderId } };
}

export async function reissueTicketAction(
  ticketId: string,
  reason: string,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  if (!reason?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "Reason is required",
        400,
        "reason",
      ),
    };
  }

  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  if (!ticket) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Ticket not found", 404),
    };
  }

  const oldQrHash = ticket.qrHash ?? "";
  const { qrCode, qrHash: newQrHash } = generateQrPayload();

  // Update ticket with new QR
  await db
    .update(tickets)
    .set({
      qrCode,
      qrHash: newQrHash,
      status: "valid",
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));

  // Create audit record
  await db.insert(ticketReissuances).values({
    ticketId,
    adminUserId: auth.user.id,
    reason: reason.trim(),
    oldQrHash,
    newQrHash,
  });

  // Dispatch email job
  await inngestClient.send({
    name: "ticket/reissued",
    data: { ticketId, tenantId: ticket.tenantId },
  });

  return { success: true, data: { id: ticketId } };
}

export type CreateTenantInput = {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  heroImageUrl?: string;
  heroTagline?: string;
  aboutText?: string;
  socialLinks?: Record<string, string>;
  config: {
    heroVisible: boolean;
    socialVisible: boolean;
    aboutVisible: boolean;
  };
  currency: string;
  feePercentage: number;
  feeFixed: number;
};

export async function createTenantAction(
  input: CreateTenantInput,
): Promise<ActionResult<{ id: string; tenantId: string }>> {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return { success: false, error: auth.error };
  }

  // Validate slug uniqueness
  const slugExists = await getProducerBySlugExists(input.slug);
  if (slugExists) {
    return {
      success: false,
      error: createAppError(
        "SLUG_TAKEN",
        "Ya existe una productora con ese slug",
        400,
        "slug",
      ),
    };
  }

  // Create Supabase Auth user with service role client
  const supabaseAdmin = createSupabaseServiceClient();
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: input.adminEmail,
      password: input.adminPassword,
      email_confirm: true,
      app_metadata: {
        role: "producer_admin",
      },
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: createAppError(
        "AUTH_ERROR",
        authError?.message ?? "Error al crear usuario",
        500,
      ),
    };
  }

  const tenantId = authData.user.id;

  // Update app_metadata with tenant_id now that we have the user id
  await supabaseAdmin.auth.admin.updateUserById(tenantId, {
    app_metadata: {
      role: "producer_admin",
      tenant_id: tenantId,
    },
  });

  // Create producer record
  const [producer] = await db
    .insert(producers)
    .values({
      tenantId,
      slug: input.slug,
      name: input.name,
      logoUrl: input.logoUrl || null,
      primaryColor: input.primaryColor,
      accentColor: input.accentColor,
      heroImageUrl: input.heroImageUrl || null,
      heroTagline: input.heroTagline || null,
      aboutText: input.aboutText || null,
      socialLinks: input.socialLinks ?? {},
      config: input.config,
      currency: input.currency,
      feePercentage: input.feePercentage,
      feeFixed: input.feeFixed,
    })
    .returning();

  return { success: true, data: { id: producer.id, tenantId } };
}
