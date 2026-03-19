import { inngestClient } from "@/lib/inngest/client";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { tickets } from "@/lib/db/schema/tickets";
import { events } from "@/lib/db/schema/events";
import { producers } from "@/lib/db/schema/producers";
import { eq, and } from "drizzle-orm";
import { mercadopagoAdapter } from "@/lib/payments/mercadopago-client";
import { Resend } from "resend";
import { CancellationEmail } from "@/lib/email/cancellation-email";
import { formatDateTime } from "@/lib/utils/dates";

export const processEventCancellation = inngestClient.createFunction(
  { id: "process-event-cancellation", retries: 3 },
  { event: "event/cancelled" },
  // @ts-expect-error Inngest v4 handler signature
  async ({ event, step }: { event: { data: { eventId: string; tenantId: string } }; step: any }) => {
    const { eventId, tenantId } = event.data;

    // Step 1: Get all paid orders for refund
    const paidOrders = await step.run("fetch-paid-orders", async () => {
      return db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.tenantId, tenantId),
            eq(orders.eventId, eventId),
            eq(orders.status, "paid"),
          ),
        );
    });

    // Step 2: Process refunds individually
    for (const order of paidOrders) {
      await step.run(`refund-order-${order.id}`, async () => {
        if (!order.mercadopagoPaymentId) {
          // Cash/transfer orders - just mark as refunded
          await db
            .update(orders)
            .set({
              status: "refunded",
              refundStatus: "completed",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));
          return;
        }

        try {
          await mercadopagoAdapter.processRefund({
            paymentId: order.mercadopagoPaymentId,
            amount: order.totalAmount,
          });
          await db
            .update(orders)
            .set({
              status: "refunded",
              refundStatus: "completed",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));
        } catch {
          await db
            .update(orders)
            .set({ refundStatus: "failed", updatedAt: new Date() })
            .where(eq(orders.id, order.id));
        }
      });
    }

    // Step 3: Cancel all tickets for the event
    await step.run("cancel-tickets", async () => {
      await db
        .update(tickets)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(
          and(
            eq(tickets.tenantId, tenantId),
            eq(tickets.eventId, eventId),
          ),
        );
    });

    // Step 4: Fetch event + producer data for emails
    const emailContext = await step.run("fetch-email-context", async () => {
      const [event] = await db
        .select()
        .from(events)
        .where(and(eq(events.tenantId, tenantId), eq(events.id, eventId)))
        .limit(1);
      const [producer] = await db
        .select()
        .from(producers)
        .where(and(eq(producers.tenantId, tenantId), eq(producers.isActive, true)))
        .limit(1);
      return { event, producer };
    });

    // Step 5: Send cancellation emails to each buyer
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const order of paidOrders) {
      await step.run(`send-cancellation-email-${order.id}`, async () => {
        if (!emailContext.event || !emailContext.producer) return;

        const { event, producer } = emailContext;

        await resend.emails.send({
          from: `${producer.name} <noreply@${process.env.RESEND_DOMAIN || "ticktu.com"}>`,
          to: order.buyerEmail,
          subject: `Evento cancelado: ${event.name}`,
          react: CancellationEmail({
            eventName: event.name,
            eventDate: formatDateTime(event.date),
            eventVenue: event.venue,
            buyerName: order.buyerName,
            producerName: producer.name,
            producerLogoUrl: producer.logoUrl,
            primaryColor: producer.primaryColor,
            refundAmount: (order.totalAmount / 100).toFixed(2),
            currency: order.currency,
          }),
        });
      });
    }

    return { refundedOrders: paidOrders.length };
  },
);
