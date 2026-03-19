import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const scans = pgTable(
  "scans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    eventId: uuid("event_id").notNull(),
    ticketId: uuid("ticket_id"),
    qrHash: text("qr_hash").notNull(),
    status: text("status", {
      enum: ["valid", "invalid", "duplicate", "conflict"],
    }).notNull(),
    operatorName: text("operator_name").notNull(),
    deviceId: text("device_id").notNull(),
    scannedAt: timestamp("scanned_at", { withTimezone: true }).notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    conflictReason: text("conflict_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_scans_tenant_id").on(table.tenantId),
    index("idx_scans_event_id").on(table.eventId),
    index("idx_scans_qr_hash").on(table.qrHash),
  ],
);

export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
export type ScanStatus = "valid" | "invalid" | "duplicate" | "conflict";
