import { inngestClient } from "@/lib/inngest/client";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { tickets } from "@/lib/db/schema/tickets";
import { eq, and } from "drizzle-orm";
import { mercadopagoAdapter } from "@/lib/payments/mercadopago-client";

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

    // Step 4: Send cancellation emails
    await step.run("send-cancellation-emails", async () => {
      // TODO: Implement react-email cancellation template and Resend delivery
    });

    return { refundedOrders: paidOrders.length };
  },
);
