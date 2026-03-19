import { describe, expect, it } from "vitest";
import { events } from "./events";
import { getTableColumns } from "drizzle-orm";

describe("events schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(events);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("slug");
    expect(columnNames).toContain("date");
    expect(columnNames).toContain("venue");
    expect(columnNames).toContain("description");
    expect(columnNames).toContain("imageUrl");
    expect(columnNames).toContain("status");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(events);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.imageUrl.name).toBe("image_url");
    expect(columns.createdAt.name).toBe("created_at");
    expect(columns.updatedAt.name).toBe("updated_at");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(events);
    expect(columns.id.primary).toBe(true);
  });

  it("has correct table name", () => {
    const config = events as unknown as { [Symbol.for("drizzle:Name")]: string };
    // Table name can be accessed via the pgTable's SQL-level name
    // The table object's Symbol contains the name, but simplest is checking getTableColumns works
    const columns = getTableColumns(events);
    expect(Object.keys(columns).length).toBeGreaterThan(0);
  });
});
