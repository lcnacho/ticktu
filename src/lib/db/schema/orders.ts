import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    eventId: uuid("event_id").notNull(),
    buyerName: text("buyer_name").notNull(),
    buyerEmail: text("buyer_email").notNull(),
    status: text("status", {
      enum: ["pending", "paid", "payment_failed", "refunded", "cancelled"],
    })
      .notNull()
      .default("pending"),
    paymentMethod: text("payment_method", {
      enum: ["mercadopago", "cash", "transfer"],
    }).notNull(),
    totalAmount: integer("total_amount").notNull(),
    feeAmount: integer("fee_amount").notNull(),
    currency: text("currency").notNull(),
    mercadopagoPreferenceId: text("mercadopago_preference_id"),
    mercadopagoPaymentId: text("mercadopago_payment_id"),
    refundStatus: text("refund_status", {
      enum: ["pending", "completed", "failed"],
    }),
    emailStatus: text("email_status", {
      enum: ["pending", "sent", "failed"],
    }),
    rrppLinkId: uuid("rrpp_link_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_orders_tenant_id").on(table.tenantId),
    index("idx_orders_event_id").on(table.eventId),
    index("idx_orders_status").on(table.status),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderStatus =
  | "pending"
  | "paid"
  | "payment_failed"
  | "refunded"
  | "cancelled";
