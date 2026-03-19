import { describe, expect, it } from "vitest";
import { scans } from "./scans";
import { getTableColumns } from "drizzle-orm";

describe("scans schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(scans);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("ticketId");
    expect(columnNames).toContain("qrHash");
    expect(columnNames).toContain("status");
    expect(columnNames).toContain("operatorName");
    expect(columnNames).toContain("deviceId");
    expect(columnNames).toContain("scannedAt");
    expect(columnNames).toContain("syncedAt");
    expect(columnNames).toContain("conflictReason");
    expect(columnNames).toContain("createdAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(scans);
    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.ticketId.name).toBe("ticket_id");
    expect(columns.qrHash.name).toBe("qr_hash");
    expect(columns.operatorName.name).toBe("operator_name");
    expect(columns.deviceId.name).toBe("device_id");
    expect(columns.scannedAt.name).toBe("scanned_at");
    expect(columns.syncedAt.name).toBe("synced_at");
    expect(columns.conflictReason.name).toBe("conflict_reason");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(scans);
    expect(columns.id.primary).toBe(true);
  });
});
