import {
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    orderId: uuid("order_id").notNull(),
    ticketTypeId: uuid("ticket_type_id").notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    feeAmount: integer("fee_amount").notNull(),
    holderName: text("holder_name").notNull(),
    holderEmail: text("holder_email").notNull(),
  },
  (table) => [
    index("idx_order_items_tenant_id").on(table.tenantId),
    index("idx_order_items_order_id").on(table.orderId),
    index("idx_order_items_ticket_type_id").on(table.ticketTypeId),
  ],
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
