import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { orders, type Order } from "@/lib/db/schema/orders";
import { orderItems, type OrderItem } from "@/lib/db/schema/order-items";
import { ticketTypes } from "@/lib/db/schema/ticket-types";

export async function getOrderById(
  tenantId: string,
  orderId: string,
): Promise<Order | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.id, orderId)))
    .limit(1);
  return order ?? null;
}

export async function getOrdersByEvent(
  tenantId: string,
  eventId: string,
): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(and(eq(orders.tenantId, tenantId), eq(orders.eventId, eventId)))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItemsByOrder(
  tenantId: string,
  orderId: string,
): Promise<OrderItem[]> {
  return db
    .select()
    .from(orderItems)
    .where(
      and(eq(orderItems.tenantId, tenantId), eq(orderItems.orderId, orderId)),
    );
}

export async function getRecentOrdersByTenant(
  tenantId: string,
  limit: number = 20,
): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function createOrder(data: {
  tenantId: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  paymentMethod: "mercadopago" | "cash" | "transfer";
  totalAmount: number;
  feeAmount: number;
  currency: string;
  mercadopagoPreferenceId?: string;
  rrppLinkId?: string;
}): Promise<Order> {
  const [order] = await db.insert(orders).values(data).returning();
  return order;
}

export async function createOrderItems(
  items: {
    tenantId: string;
    orderId: string;
    ticketTypeId: string;
    quantity: number;
    unitPrice: number;
    feeAmount: number;
    holderName: string;
    holderEmail: string;
  }[],
): Promise<OrderItem[]> {
  return db.insert(orderItems).values(items).returning();
}

export async function updateOrderStatus(
  tenantId: string,
  orderId: string,
  data: Partial<
    Pick<
      Order,
      | "status"
      | "mercadopagoPreferenceId"
      | "mercadopagoPaymentId"
      | "refundStatus"
      | "emailStatus"
    >
  >,
): Promise<Order | null> {
  const [updated] = await db
    .update(orders)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(orders.tenantId, tenantId), eq(orders.id, orderId)))
    .returning();
  return updated ?? null;
}

export async function atomicIncrementSoldCount(
  tenantId: string,
  ticketTypeId: string,
  quantity: number,
  tx?: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<boolean> {
  const executor = tx ?? db;
  const result = await executor
    .update(ticketTypes)
    .set({
      soldCount: sql`${ticketTypes.soldCount} + ${quantity}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(ticketTypes.tenantId, tenantId),
        eq(ticketTypes.id, ticketTypeId),
        sql`${ticketTypes.soldCount} + ${quantity} <= ${ticketTypes.maxCapacity}`,
      ),
    )
    .returning({ id: ticketTypes.id });
  return result.length > 0;
}

export async function getPendingOrdersOlderThan(
  minutes: number,
): Promise<Order[]> {
  return db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, "pending"),
        sql`${orders.createdAt} < now() - interval '${sql.raw(String(minutes))} minutes'`,
      ),
    );
}

export async function getOrdersByEventForRefund(
  tenantId: string,
  eventId: string,
): Promise<Order[]> {
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
}
