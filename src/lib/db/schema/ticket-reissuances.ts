import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const ticketReissuances = pgTable("ticket_reissuances", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull(),
  adminUserId: uuid("admin_user_id").notNull(),
  reason: text("reason").notNull(),
  oldQrHash: text("old_qr_hash").notNull(),
  newQrHash: text("new_qr_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TicketReissuance = typeof ticketReissuances.$inferSelect;
export type NewTicketReissuance = typeof ticketReissuances.$inferInsert;
