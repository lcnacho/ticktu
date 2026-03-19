import { describe, expect, it } from "vitest";
import { ticketReissuances } from "./ticket-reissuances";
import { getTableColumns } from "drizzle-orm";

describe("ticket_reissuances schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(ticketReissuances);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("ticketId");
    expect(columnNames).toContain("adminUserId");
    expect(columnNames).toContain("reason");
    expect(columnNames).toContain("oldQrHash");
    expect(columnNames).toContain("newQrHash");
    expect(columnNames).toContain("createdAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(ticketReissuances);
    expect(columns.ticketId.name).toBe("ticket_id");
    expect(columns.adminUserId.name).toBe("admin_user_id");
    expect(columns.oldQrHash.name).toBe("old_qr_hash");
    expect(columns.newQrHash.name).toBe("new_qr_hash");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(ticketReissuances);
    expect(columns.id.primary).toBe(true);
  });
});
