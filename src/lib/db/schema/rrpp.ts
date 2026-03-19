import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const rrppPromoters = pgTable(
  "rrpp_promoters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_rrpp_promoters_tenant_id").on(table.tenantId),
    uniqueIndex("idx_rrpp_promoters_tenant_name").on(
      table.tenantId,
      table.name,
    ),
  ],
);

export const rrppLinks = pgTable(
  "rrpp_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    eventId: uuid("event_id").notNull(),
    promoterId: uuid("promoter_id").notNull(),
    code: text("code").notNull().unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_rrpp_links_tenant_id").on(table.tenantId),
    index("idx_rrpp_links_event_id").on(table.eventId),
    index("idx_rrpp_links_code").on(table.code),
    uniqueIndex("idx_rrpp_links_event_promoter").on(
      table.eventId,
      table.promoterId,
    ),
  ],
);

export type RRPPPromoter = typeof rrppPromoters.$inferSelect;
export type NewRRPPPromoter = typeof rrppPromoters.$inferInsert;
export type RRPPLink = typeof rrppLinks.$inferSelect;
export type NewRRPPLink = typeof rrppLinks.$inferInsert;
