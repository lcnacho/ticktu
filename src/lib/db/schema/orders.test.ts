import { describe, expect, it } from "vitest";
import { orders } from "./orders";
import { getTableColumns } from "drizzle-orm";

describe("orders schema", () => {
  it("has all required columns", () => {
    const columns = getTableColumns(orders);
    const columnNames = Object.keys(columns);

    expect(columnNames).toContain("id");
    expect(columnNames).toContain("tenantId");
    expect(columnNames).toContain("eventId");
    expect(columnNames).toContain("buyerName");
    expect(columnNames).toContain("buyerEmail");
    expect(columnNames).toContain("status");
    expect(columnNames).toContain("paymentMethod");
    expect(columnNames).toContain("totalAmount");
    expect(columnNames).toContain("feeAmount");
    expect(columnNames).toContain("currency");
    expect(columnNames).toContain("mercadopagoPreferenceId");
    expect(columnNames).toContain("mercadopagoPaymentId");
    expect(columnNames).toContain("refundStatus");
    expect(columnNames).toContain("emailStatus");
    expect(columnNames).toContain("rrppLinkId");
    expect(columnNames).toContain("createdAt");
    expect(columnNames).toContain("updatedAt");
  });

  it("maps to snake_case DB column names", () => {
    const columns = getTableColumns(orders);

    expect(columns.tenantId.name).toBe("tenant_id");
    expect(columns.eventId.name).toBe("event_id");
    expect(columns.buyerName.name).toBe("buyer_name");
    expect(columns.buyerEmail.name).toBe("buyer_email");
    expect(columns.paymentMethod.name).toBe("payment_method");
    expect(columns.totalAmount.name).toBe("total_amount");
    expect(columns.feeAmount.name).toBe("fee_amount");
    expect(columns.mercadopagoPreferenceId.name).toBe(
      "mercadopago_preference_id",
    );
    expect(columns.mercadopagoPaymentId.name).toBe("mercadopago_payment_id");
    expect(columns.refundStatus.name).toBe("refund_status");
    expect(columns.emailStatus.name).toBe("email_status");
    expect(columns.rrppLinkId.name).toBe("rrpp_link_id");
  });

  it("has uuid primary key", () => {
    const columns = getTableColumns(orders);
    expect(columns.id.primary).toBe(true);
  });
});
