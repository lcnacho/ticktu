import { describe, expect, it } from "vitest";
import { expenses } from "./expenses";
import { getTableColumns } from "drizzle-orm";

describe("expenses schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(expenses);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("category");
    expect(columnNames).toContain("description");
    expect(columnNames).toContain("amountCents");
    expect(columnNames).toContain("currency");
    expect(columnNames).toContain("expenseDate");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(expenses);
    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.amountCents.name).toBe("amount_cents");
    expect(columns.expenseDate.name).toBe("expense_date");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(expenses);
    expect(columns.id.primary).toBe(true);
  });
});
