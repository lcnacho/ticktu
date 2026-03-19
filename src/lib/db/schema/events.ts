import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    venue: text("venue").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    status: text("status", {
      enum: ["draft", "published", "finished", "archived", "cancelled"],
    })
      .notNull()
      .default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_events_tenant_id").on(table.tenantId),
    index("idx_events_tenant_id_status").on(table.tenantId, table.status),
    uniqueIndex("idx_events_tenant_id_slug").on(table.tenantId, table.slug),
  ],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventStatus =
  | "draft"
  | "published"
  | "finished"
  | "archived"
  | "cancelled";
