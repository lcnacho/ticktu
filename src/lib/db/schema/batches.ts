import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const batches = pgTable(
  "batches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    ticketTypeId: uuid("ticket_type_id").notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    soldCount: integer("sold_count").notNull().default(0),
    activatesAt: timestamp("activates_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_batches_tenant_id").on(table.tenantId),
    index("idx_batches_ticket_type_id").on(table.ticketTypeId),
  ],
);

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;
