import { describe, expect, it } from "vitest";
import { batches } from "./batches";
import { getTableColumns } from "drizzle-orm";

describe("batches schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(batches);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("ticketTypeId");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("quantity");
    expect(columnNames).toContain("soldCount");
    expect(columnNames).toContain("activatesAt");
    expect(columnNames).toContain("isActive");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(batches);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.ticketTypeId.name).toBe("ticket_type_id");
    expect(columns.soldCount.name).toBe("sold_count");
    expect(columns.activatesAt.name).toBe("activates_at");
    expect(columns.isActive.name).toBe("is_active");
    expect(columns.createdAt.name).toBe("created_at");
    expect(columns.updatedAt.name).toBe("updated_at");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(batches);
    expect(columns.id.primary).toBe(true);
  });
});
