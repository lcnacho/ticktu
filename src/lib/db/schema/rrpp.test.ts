import { describe, expect, it } from "vitest";
import { rrppPromoters, rrppLinks } from "./rrpp";
import { getTableColumns } from "drizzle-orm";

describe("rrpp_promoters schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(rrppPromoters);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("name");
    expect(columnNames).toContain("phone");
    expect(columnNames).toContain("email");
    expect(columnNames).toContain("isActive");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(rrppPromoters);
    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.isActive.name).toBe("is_active");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(rrppPromoters);
    expect(columns.id.primary).toBe(true);
  });
});

describe("rrpp_links schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(rrppLinks);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("promoterId");
    expect(columnNames).toContain("code");
    expect(columnNames).toContain("isActive");
    expect(columnNames).toContain("createdAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(rrppLinks);
    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.promoterId.name).toBe("promoter_id");
    expect(columns.isActive.name).toBe("is_active");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(rrppLinks);
    expect(columns.id.primary).toBe(true);
  });
});
