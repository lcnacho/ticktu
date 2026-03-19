import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    eventId: uuid("event_id"),
    category: text("category", {
      enum: [
        "venue",
        "djs",
        "security",
        "marketing",
        "staff",
        "production",
        "other",
      ],
    }).notNull(),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    expenseDate: timestamp("expense_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_expenses_tenant_id").on(table.tenantId),
    index("idx_expenses_event_id").on(table.eventId),
  ],
);

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseCategory =
  | "venue"
  | "djs"
  | "security"
  | "marketing"
  | "staff"
  | "production"
  | "other";
