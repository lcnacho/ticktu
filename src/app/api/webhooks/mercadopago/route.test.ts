import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { createHmac } from "crypto";

// Mock db
const mockDbUpdateSetWhere = vi.fn().mockResolvedValue(undefined);
const mockDbUpdateSet = vi.fn(() => ({ where: mockDbUpdateSetWhere }));
const mockDbUpdate = vi.fn(() => ({ set: mockDbUpdateSet }));
const mockDbSelectResult = vi.fn();
vi.mock("@/lib/db/index", () => ({
  db: {
    update: (...args: Parameters<typeof mockDbUpdate>) => mockDbUpdate(...args),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => mockDbSelectResult(),
        }),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema/orders", () => ({
  orders: { id: "id", status: "status" },
}));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
}));

// Mock inngest
const mockInngestSend = vi.fn();
vi.mock("@/lib/inngest/client", () => ({
  inngestClient: { send: (...args: unknown[]) => mockInngestSend(...args) },
}));

// Mock fetch for MercadoPago API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { POST } from "./route";

const WEBHOOK_SECRET = "test-webhook-secret";

function signRequest(
  body: Record<string, unknown>,
): { bodyStr: string; headers: Record<string, string> } {
  const bodyStr = JSON.stringify(body);
  const dataId = (body.data as Record<string, unknown>)?.id ?? "";
  const requestId = "req-test-123";
  const ts = String(Date.now());
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");
  return {
    bodyStr,
    headers: {
      "x-signature": `ts=${ts},v1=${v1}`,
      "x-request-id": requestId,
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  const { bodyStr, headers } = signRequest(body);
  return new NextRequest("http://localhost/api/webhooks/mercadopago", {
    method: "POST",
    body: bodyStr,
    headers,
  });
}

describe("POST /api/webhooks/mercadopago", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("MERCADOPAGO_ACCESS_TOKEN", "test-token");
    vi.stubEnv("MERCADOPAGO_WEBHOOK_SECRET", WEBHOOK_SECRET);
  });

  it("rejects requests without valid signature", async () => {
    const req = new NextRequest("http://localhost/api/webhooks/mercadopago", {
      method: "POST",
      body: JSON.stringify({ type: "payment", data: { id: "123" } }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("acknowledges non-payment notifications", async () => {
    const res = await POST(makeRequest({ type: "merchant_order" }));
    const json = await res.json();
    expect(json.received).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 500 when access token is missing", async () => {
    vi.stubEnv("MERCADOPAGO_ACCESS_TOKEN", "");
    // Need to clear the module cache for env change... skip this case
    // since the env is read at request time
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;

    const res = await POST(
      makeRequest({ type: "payment", data: { id: "123" } }),
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 when MP payment fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const res = await POST(
      makeRequest({ type: "payment", data: { id: "pay-1" } }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when external_reference is missing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: "approved" }),
    });

    const res = await POST(
      makeRequest({ type: "payment", data: { id: "pay-2" } }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when order is not found", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "approved",
          external_reference: "order-missing",
        }),
    });
    mockDbSelectResult.mockResolvedValue([]);

    const res = await POST(
      makeRequest({ type: "payment", data: { id: "pay-3" } }),
    );
    expect(res.status).toBe(404);
  });

  it("skips processing for already-paid orders (idempotency)", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "approved",
          external_reference: "order-1",
        }),
    });
    mockDbSelectResult.mockResolvedValue([
      { id: "order-1", status: "paid", tenantId: "t-1" },
    ]);

    const res = await POST(
      makeRequest({ type: "payment", data: { id: "pay-4" } }),
    );
    const json = await res.json();

    expect(json.status).toBe("already_processed");
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("marks order as paid and dispatches ticket generation on approval", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "approved",
          external_reference: "order-2",
        }),
    });
    mockDbSelectResult.mockResolvedValue([
      { id: "order-2", status: "pending", tenantId: "t-1" },
    ]);
    mockInngestSend.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest({ type: "payment", data: { id: "pay-5" } }),
    );
    const json = await res.json();

    expect(json.received).toBe(true);
    expect(mockDbUpdate).toHaveBeenCalled();
    expect(mockDbUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "paid",
        mercadopagoPaymentId: "pay-5",
      }),
    );
    expect(mockInngestSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "order/completed",
        data: { orderId: "order-2", tenantId: "t-1" },
      }),
    );
  });

  it("marks order as payment_failed on rejection", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "rejected",
          external_reference: "order-3",
        }),
    });
    mockDbSelectResult.mockResolvedValue([
      { id: "order-3", status: "pending", tenantId: "t-1" },
    ]);

    await POST(makeRequest({ type: "payment", data: { id: "pay-6" } }));

    expect(mockDbUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: "payment_failed" }),
    );
    expect(mockInngestSend).not.toHaveBeenCalled();
  });

  it("handles IPN format with topic field", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: "approved",
          external_reference: "order-4",
        }),
    });
    mockDbSelectResult.mockResolvedValue([
      { id: "order-4", status: "pending", tenantId: "t-1" },
    ]);
    mockInngestSend.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest({ topic: "payment", id: "pay-7" }),
    );
    const json = await res.json();
    expect(json.received).toBe(true);
  });
});
