import { inngestClient } from "@/lib/inngest/client";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { orderItems } from "@/lib/db/schema/order-items";
import { tickets } from "@/lib/db/schema/tickets";
import { events } from "@/lib/db/schema/events";
import { producers } from "@/lib/db/schema/producers";
import { ticketTypes } from "@/lib/db/schema/ticket-types";
import { eq, and, inArray } from "drizzle-orm";
import { generateQrPayload } from "@/lib/qr/generate";
import { Resend } from "resend";
import { TicketEmail } from "@/lib/email/ticket-email";
import { formatDateTime } from "@/lib/utils/dates";

export const sendTicketEmails = inngestClient.createFunction(
  { id: "send-ticket-emails", retries: 3 },
  { event: "order/completed" },
  // @ts-expect-error Inngest v4 handler signature
  async ({ event, step }: { event: { data: { orderId: string; tenantId: string } }; step: any }) => {
    const { orderId, tenantId } = event.data;

    // Step 1: Get order and items
    const order = await step.run("fetch-order", async () => {
      const [o] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId)))
        .limit(1);
      return o;
    });

    if (!order) return { error: "Order not found" };

    const items = await step.run("fetch-order-items", async () => {
      return db
        .select()
        .from(orderItems)
        .where(
          and(
            eq(orderItems.orderId, orderId),
            eq(orderItems.tenantId, tenantId),
          ),
        );
    });

    // Step 2: Create tickets with QR codes (idempotent)
    const createdTickets = await step.run("create-tickets", async () => {
      const ticketRecords = [];
      for (const item of items) {
        // Check if ticket already exists for this order item (idempotency)
        const [existing] = await db
          .select()
          .from(tickets)
          .where(
            and(
              eq(tickets.tenantId, tenantId),
              eq(tickets.orderItemId, item.id),
            ),
          )
          .limit(1);

        if (existing) {
          ticketRecords.push(existing);
          continue;
        }

        const { qrCode, qrHash } = generateQrPayload();

        const [ticket] = await db
          .insert(tickets)
          .values({
            tenantId,
            eventId: order.eventId,
            ticketTypeId: item.ticketTypeId,
            orderId: order.id,
            orderItemId: item.id,
            holderName: item.holderName,
            holderEmail: item.holderEmail,
            isComplimentary: false,
            qrCode,
            qrHash,
            status: "valid",
          })
          .returning();

        ticketRecords.push(ticket);
      }
      return ticketRecords;
    });

    // Step 3: Fetch event, producer, and ticket type data for email
    const emailContext = await step.run("fetch-email-context", async () => {
      const [event] = await db
        .select()
        .from(events)
        .where(and(eq(events.tenantId, tenantId), eq(events.id, order.eventId)))
        .limit(1);
      const [producer] = await db
        .select()
        .from(producers)
        .where(and(eq(producers.tenantId, tenantId), eq(producers.isActive, true)))
        .limit(1);
      const typeIds = [...new Set(items.map((i: { ticketTypeId: string }) => i.ticketTypeId))];
      const types = typeIds.length > 0
        ? await db
            .select()
            .from(ticketTypes)
            .where(inArray(ticketTypes.id, typeIds as string[]))
        : [];
      return { event, producer, types };
    });

    // Step 4: Send email via Resend
    await step.run("send-email", async () => {
      if (!emailContext.event || !emailContext.producer) {
        await db
          .update(orders)
          .set({ emailStatus: "failed", updatedAt: new Date() })
          .where(eq(orders.id, orderId));
        return;
      }

      const { event, producer, types } = emailContext;
      const typeMap = new Map(types.map((t: { id: string; name: string }) => [t.id, t.name]));

      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: `${producer.name} <noreply@${process.env.RESEND_DOMAIN || "ticktu.com"}>`,
        to: order.buyerEmail,
        subject: `Tus entradas para ${event.name}`,
        react: TicketEmail({
          eventName: event.name,
          eventDate: formatDateTime(event.date),
          eventVenue: event.venue,
          buyerName: order.buyerName,
          producerName: producer.name,
          producerLogoUrl: producer.logoUrl,
          primaryColor: producer.primaryColor,
          tickets: createdTickets.map((t: { holderName: string; ticketTypeId: string; qrCode: string }) => ({
            holderName: t.holderName,
            ticketTypeName: typeMap.get(t.ticketTypeId) || "Entrada",
            qrCode: t.qrCode,
          })),
        }),
      });

      await db
        .update(orders)
        .set({ emailStatus: "sent", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    });

    return { ticketCount: createdTickets.length };
  },
);
