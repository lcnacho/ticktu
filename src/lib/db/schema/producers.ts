import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const producers = pgTable(
  "producers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().unique(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").notNull().default("#6366f1"),
    accentColor: text("accent_color").notNull().default("#f59e0b"),
    heroImageUrl: text("hero_image_url"),
    heroTagline: text("hero_tagline"),
    aboutText: text("about_text"),
    socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
    config: jsonb("config")
      .$type<{
        heroVisible: boolean;
        socialVisible: boolean;
        aboutVisible: boolean;
      }>()
      .notNull()
      .default({ heroVisible: true, socialVisible: true, aboutVisible: true }),
    currency: text("currency").notNull().default("UYU"),
    feePercentage: integer("fee_percentage").notNull().default(5),
    feeFixed: integer("fee_fixed").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_producers_tenant_id").on(table.tenantId),
    uniqueIndex("idx_producers_slug").on(table.slug),
  ],
);

export type Producer = typeof producers.$inferSelect;
export type NewProducer = typeof producers.$inferInsert;
