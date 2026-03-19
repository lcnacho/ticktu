import { describe, expect, it } from "vitest";
import { eventAccessCodes } from "./event-access-codes";
import { getTableColumns } from "drizzle-orm";

describe("event_access_codes schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(eventAccessCodes);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("code");
    expect(columnNames).toContain("expiresAt");
    expect(columnNames).toContain("isActive");
    expect(columnNames).toContain("createdAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(eventAccessCodes);
    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.expiresAt.name).toBe("expires_at");
    expect(columns.isActive.name).toBe("is_active");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(eventAccessCodes);
    expect(columns.id.primary).toBe(true);
  });
});
