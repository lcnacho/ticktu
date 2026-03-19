import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock validation queries
const mockGetTicketByQrHash = vi.fn();
const mockMarkTicketAsUsed = vi.fn();
const mockCreateScan = vi.fn();
vi.mock("@/lib/db/queries/validation", () => ({
  getTicketByQrHash: (...args: unknown[]) => mockGetTicketByQrHash(...args),
  markTicketAsUsed: (...args: unknown[]) => mockMarkTicketAsUsed(...args),
  createScan: (...args: unknown[]) => mockCreateScan(...args),
}));

// Mock session token verification
vi.mock("@/lib/validation/session-token", () => ({
  verifySessionToken: (token: string) => {
    if (token === "valid-token") {
      return { eventId: "event-1", tenantId: "tenant-1" };
    }
    return null;
  },
}));

import { POST } from "./route";

function makeRequest(body: Record<string, unknown>, token = "valid-token") {
  return new NextRequest("http://localhost/api/validation/scan", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

const baseBody = {
  qrHash: "abc123hash",
  eventId: "event-1",
  tenantId: "tenant-1",
  operatorName: "Operator A",
  deviceId: "device-1",
  scannedAt: new Date().toISOString(),
};

describe("POST /api/validation/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateScan.mockResolvedValue({ id: "scan-1" });
    mockMarkTicketAsUsed.mockResolvedValue(undefined);
  });

  it("returns 401 when no auth token is provided", async () => {
    const req = new NextRequest("http://localhost/api/validation/scan", {
      method: "POST",
      body: JSON.stringify(baseBody),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is invalid", async () => {
    const res = await POST(makeRequest(baseBody, "bad-token"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({ qrHash: "abc" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing required fields");
  });

  it("returns invalid when ticket is not found", async () => {
    mockGetTicketByQrHash.mockResolvedValue(null);

    const res = await POST(makeRequest(baseBody));
    const json = await res.json();

    expect(json.status).toBe("invalid");
    expect(json.reason).toBe("No encontrado");
    expect(mockCreateScan).toHaveBeenCalledWith(
      expect.objectContaining({ status: "invalid", qrHash: "abc123hash" }),
    );
  });

  it("returns duplicate when ticket is already used", async () => {
    mockGetTicketByQrHash.mockResolvedValue({
      ticketId: "t-1",
      holderName: "Juan",
      ticketType: "VIP",
      status: "used",
    });

    const res = await POST(makeRequest(baseBody));
    const json = await res.json();

    expect(json.status).toBe("duplicate");
    expect(json.reason).toBe("Ya fue usado");
    expect(json.holderName).toBe("Juan");
    expect(json.ticketType).toBe("VIP");
    expect(mockCreateScan).toHaveBeenCalledWith(
      expect.objectContaining({ status: "duplicate", ticketId: "t-1" }),
    );
  });

  it("returns invalid when ticket is cancelled", async () => {
    mockGetTicketByQrHash.mockResolvedValue({
      ticketId: "t-2",
      holderName: "Ana",
      ticketType: "General",
      status: "cancelled",
    });

    const res = await POST(makeRequest(baseBody));
    const json = await res.json();

    expect(json.status).toBe("invalid");
    expect(json.reason).toBe("Ticket cancelado");
  });

  it("returns valid and marks ticket as used for valid ticket", async () => {
    mockGetTicketByQrHash.mockResolvedValue({
      ticketId: "t-3",
      holderName: "Carlos",
      ticketType: "General",
      status: "valid",
    });

    const res = await POST(makeRequest(baseBody));
    const json = await res.json();

    expect(json.status).toBe("valid");
    expect(json.holderName).toBe("Carlos");
    expect(json.ticketType).toBe("General");
    expect(mockMarkTicketAsUsed).toHaveBeenCalledWith("tenant-1", "t-3");
    expect(mockCreateScan).toHaveBeenCalledWith(
      expect.objectContaining({ status: "valid", ticketId: "t-3" }),
    );
  });

  it("records scan with correct operator and device info", async () => {
    mockGetTicketByQrHash.mockResolvedValue({
      ticketId: "t-4",
      holderName: "Test",
      ticketType: "VIP",
      status: "valid",
    });

    await POST(makeRequest(baseBody));

    expect(mockCreateScan).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-1",
        eventId: "event-1",
        operatorName: "Operator A",
        deviceId: "device-1",
      }),
    );
  });
});
