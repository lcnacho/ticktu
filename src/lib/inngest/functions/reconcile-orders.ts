import { inngestClient } from "@/lib/inngest/client";
import { db } from "@/lib/db/index";
import { orders } from "@/lib/db/schema/orders";
import { eq, and, sql } from "drizzle-orm";
import { mercadopagoAdapter } from "@/lib/payments/mercadopago-client";

export const reconcileOrders = inngestClient.createFunction(
  { id: "reconcile-orders" },
  { cron: "*/5 * * * *" },
  // @ts-expect-error Inngest v4 handler signature
  async ({ step }: { step: any }) => {
    const staleOrders = await step.run("fetch-stale-orders", async () => {
      return db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.status, "pending"),
            sql`${orders.createdAt} < now() - interval '10 minutes'`,
          ),
        );
    });

    let reconciled = 0;

    for (const order of staleOrders) {
      await step.run(`reconcile-${order.id}`, async () => {
        if (!order.mercadopagoPreferenceId) {
          await db
            .update(orders)
            .set({ status: "payment_failed", updatedAt: new Date() })
            .where(eq(orders.id, order.id));
          return;
        }

        try {
          const result = await mercadopagoAdapter.checkPaymentStatus({
            preferenceId: order.mercadopagoPreferenceId,
          });

          if (result.status === "approved") {
            await db
              .update(orders)
              .set({
                status: "paid",
                mercadopagoPaymentId: result.paymentId,
                updatedAt: new Date(),
              })
              .where(eq(orders.id, order.id));

            await inngestClient.send({
              name: "order/completed",
              data: { orderId: order.id, tenantId: order.tenantId },
            });
            reconciled++;
          } else if (
            result.status === "rejected" ||
            result.status === "cancelled"
          ) {
            await db
              .update(orders)
              .set({ status: "payment_failed", updatedAt: new Date() })
              .where(eq(orders.id, order.id));
          }
        } catch {
          // Leave as pending for next reconciliation cycle
        }
      });
    }

    return { checked: staleOrders.length, reconciled };
  },
);
