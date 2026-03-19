import { describe, expect, it } from "vitest";
import { orderItems } from "./order-items";
import { getTableColumns } from "drizzle-orm";

describe("order_items schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(orderItems);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("orderId");
    expect(columnNames).toContain("ticketTypeId");
    expect(columnNames).toContain("quantity");
    expect(columnNames).toContain("unitPrice");
    expect(columnNames).toContain("feeAmount");
    expect(columnNames).toContain("holderName");
    expect(columnNames).toContain("holderEmail");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(orderItems);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.orderId.name).toBe("order_id");
    expect(columns.ticketTypeId.name).toBe("ticket_type_id");
    expect(columns.unitPrice.name).toBe("unit_price");
    expect(columns.feeAmount.name).toBe("fee_amount");
    expect(columns.holderName.name).toBe("holder_name");
    expect(columns.holderEmail.name).toBe("holder_email");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(orderItems);
    expect(columns.id.primary).toBe(true);
  });
});
