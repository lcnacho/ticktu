import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock validation queries
const mockValidateEventCode = vi.fn();
vi.mock("@/lib/db/queries/validation", () => ({
  validateEventCode: (...args: unknown[]) => mockValidateEventCode(...args),
}));

// Mock db + events schema
const mockDbSelect = vi.fn();
vi.mock("@/lib/db/index", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => mockDbSelect(),
        }),
      }),
    }),
  },
}));
vi.mock("@/lib/db/schema/events", () => ({
  events: { id: "id" },
}));
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
}));

// Mock session token
vi.mock("@/lib/validation/session-token", () => ({
  createSessionToken: () => "mock-session-token",
}));

import { POST } from "./route";

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/validation/auth", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/validation/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when code is missing", async () => {
    const res = await POST(makeRequest({ operatorName: "Op" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when operatorName is missing", async () => {
    const res = await POST(makeRequest({ code: "ABC123" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 for invalid access code", async () => {
    mockValidateEventCode.mockResolvedValue(null);

    const res = await POST(makeRequest({ code: "BADCODE", operatorName: "Op" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Invalid access code");
  });

  it("returns 404 when event not found for valid code", async () => {
    mockValidateEventCode.mockResolvedValue({
      eventId: "event-1",
      tenantId: "tenant-1",
    });
    mockDbSelect.mockResolvedValue([]);

    const res = await POST(
      makeRequest({ code: "VALID1", operatorName: "Op A" }),
    );
    expect(res.status).toBe(404);
  });

  it("returns event info for valid code and existing event", async () => {
    mockValidateEventCode.mockResolvedValue({
      eventId: "event-1",
      tenantId: "tenant-1",
    });
    mockDbSelect.mockResolvedValue([{ id: "event-1", name: "Summer Party" }]);

    const res = await POST(
      makeRequest({ code: "VALID1", operatorName: "Operator A" }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.eventId).toBe("event-1");
    expect(json.eventName).toBe("Summer Party");
    expect(json.tenantId).toBe("tenant-1");
    expect(json.operatorName).toBe("Operator A");
    expect(json.sessionToken).toBe("mock-session-token");
  });
});
