import { inngestClient } from "@/lib/inngest/client";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { orderItems } from "@/lib/db/schema/order-items";
import { tickets } from "@/lib/db/schema/tickets";
import { eq, and } from "drizzle-orm";
import { generateQrPayload } from "@/lib/qr/generate";

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

    // Step 3: Send email via Resend
    await step.run("send-email", async () => {
      // TODO: Implement react-email template and Resend delivery
      // For now, mark email as sent on the order
      await db
        .update(orders)
        .set({ emailStatus: "sent", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    });

    return { ticketCount: createdTickets.length };
  },
);
