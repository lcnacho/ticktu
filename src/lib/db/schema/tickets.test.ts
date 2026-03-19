import { describe, expect, it } from "vitest";
import { tickets } from "./tickets";
import { getTableColumns } from "drizzle-orm";

describe("tickets schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(tickets);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("ticketTypeId");
    expect(columnNames).toContain("orderId");
    expect(columnNames).toContain("orderItemId");
    expect(columnNames).toContain("holderName");
    expect(columnNames).toContain("holderEmail");
    expect(columnNames).toContain("isComplimentary");
    expect(columnNames).toContain("qrCode");
    expect(columnNames).toContain("qrHash");
    expect(columnNames).toContain("status");
    expect(columnNames).toContain("issuedBy");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(tickets);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.ticketTypeId.name).toBe("ticket_type_id");
    expect(columns.orderId.name).toBe("order_id");
    expect(columns.orderItemId.name).toBe("order_item_id");
    expect(columns.holderName.name).toBe("holder_name");
    expect(columns.holderEmail.name).toBe("holder_email");
    expect(columns.isComplimentary.name).toBe("is_complimentary");
    expect(columns.qrCode.name).toBe("qr_code");
    expect(columns.qrHash.name).toBe("qr_hash");
    expect(columns.issuedBy.name).toBe("issued_by");
    expect(columns.createdAt.name).toBe("created_at");
    expect(columns.updatedAt.name).toBe("updated_at");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(tickets);
    expect(columns.id.primary).toBe(true);
  });
});
