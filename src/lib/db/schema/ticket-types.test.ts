import { describe, expect, it } from "vitest";
import { ticketTypes } from "./ticket-types";
import { getTableColumns } from "drizzle-orm";

describe("ticket_types schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(ticketTypes);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("description");
    expect(columnNames).toContain("price");
    expect(columnNames).toContain("maxCapacity");
    expect(columnNames).toContain("soldCount");
    expect(columnNames).toContain("sortOrder");
    expect(columnNames).toContain("isActive");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(ticketTypes);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.maxCapacity.name).toBe("max_capacity");
    expect(columns.soldCount.name).toBe("sold_count");
    expect(columns.sortOrder.name).toBe("sort_order");
    expect(columns.isActive.name).toBe("is_active");
    expect(columns.createdAt.name).toBe("created_at");
    expect(columns.updatedAt.name).toBe("updated_at");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(ticketTypes);
    expect(columns.id.primary).toBe(true);
  });
});
