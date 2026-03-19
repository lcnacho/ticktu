import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    eventId: uuid("event_id").notNull(),
    ticketTypeId: uuid("ticket_type_id").notNull(),
    orderId: uuid("order_id"),
    orderItemId: uuid("order_item_id"),
    holderName: text("holder_name").notNull(),
    holderEmail: text("holder_email").notNull(),
    isComplimentary: boolean("is_complimentary").notNull().default(false),
    qrCode: text("qr_code"),
    qrHash: text("qr_hash"),
    status: text("status", {
      enum: ["valid", "used", "cancelled", "reissued"],
    })
      .notNull()
      .default("valid"),
    issuedBy: uuid("issued_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_tickets_tenant_id").on(table.tenantId),
    index("idx_tickets_event_id").on(table.eventId),
    index("idx_tickets_ticket_type_id").on(table.ticketTypeId),
    uniqueIndex("idx_tickets_qr_hash").on(table.qrHash),
  ],
);

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketStatus = "valid" | "used" | "cancelled" | "reissued";
