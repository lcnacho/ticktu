import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const eventAccessCodes = pgTable(
  "event_access_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    eventId: uuid("event_id").notNull(),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_event_access_codes_event_id").on(table.eventId),
    index("idx_event_access_codes_code").on(table.code),
  ],
);

export type EventAccessCode = typeof eventAccessCodes.$inferSelect;
export type NewEventAccessCode = typeof eventAccessCodes.$inferInsert;
