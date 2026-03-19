import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/server and next/cache
vi.mock("next/server", () => ({
  after: (fn: () => void) => fn(),
}));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

// Mock supabase
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// Mock query modules
const mockGetEventById = vi.fn();
vi.mock("@/lib/db/queries/events", () => ({
  getEventById: (...args: unknown[]) => mockGetEventById(...args),
}));

const mockGetTicketTypeById = vi.fn();
vi.mock("@/lib/db/queries/ticket-types", () => ({
  getTicketTypeById: (...args: unknown[]) => mockGetTicketTypeById(...args),
}));

const mockCreateTicket = vi.fn();
const mockIncrementSoldCount = vi.fn();
vi.mock("@/lib/db/queries/tickets", () => ({
  createTicket: (...args: unknown[]) => mockCreateTicket(...args),
  incrementTicketTypeSoldCount: (...args: unknown[]) =>
    mockIncrementSoldCount(...args),
}));

import { issueComplimentaryTicketAction } from "./tickets";

const TENANT_ID = "tenant-1";
const EVENT_ID = "event-1";
const TT_ID = "tt-vip";

function mockAuth(tenantId?: string) {
  mockGetUser.mockResolvedValue({
    data: {
      user: {
        id: "u1",
        app_metadata: tenantId ? { tenant_id: tenantId } : {},
      },
    },
  });
}

const baseForm = {
  eventId: EVENT_ID,
  ticketTypeId: TT_ID,
  holderName: "VIP Guest",
  holderEmail: "vip@test.com",
};

describe("issueComplimentaryTicketAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UNAUTHORIZED when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await issueComplimentaryTicketAction(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("UNAUTHORIZED");
  });

  it("returns FORBIDDEN when no tenant_id", async () => {
    mockAuth(undefined);
    const result = await issueComplimentaryTicketAction(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });

  it("returns NOT_FOUND when event does not exist", async () => {
    mockAuth(TENANT_ID);
    mockGetEventById.mockResolvedValue(null);

    const result = await issueComplimentaryTicketAction(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("returns NOT_FOUND when ticket type does not exist", async () => {
    mockAuth(TENANT_ID);
    mockGetEventById.mockResolvedValue({ id: EVENT_ID });
    mockGetTicketTypeById.mockResolvedValue(null);

    const result = await issueComplimentaryTicketAction(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("returns VALIDATION_ERROR when holderName is empty", async () => {
    mockAuth(TENANT_ID);
    mockGetEventById.mockResolvedValue({ id: EVENT_ID });
    mockGetTicketTypeById.mockResolvedValue({ id: TT_ID, soldCount: 0, maxCapacity: 100 });

    const result = await issueComplimentaryTicketAction({
      ...baseForm,
      holderName: " ",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.field).toBe("holderName");
  });

  it("returns CAPACITY_EXCEEDED when at max capacity", async () => {
    mockAuth(TENANT_ID);
    mockGetEventById.mockResolvedValue({ id: EVENT_ID });
    mockGetTicketTypeById.mockResolvedValue({
      id: TT_ID,
      soldCount: 100,
      maxCapacity: 100,
    });

    const result = await issueComplimentaryTicketAction(baseForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("CAPACITY_EXCEEDED");
  });

  it("issues complimentary ticket on happy path", async () => {
    mockAuth(TENANT_ID);
    mockGetEventById.mockResolvedValue({ id: EVENT_ID });
    mockGetTicketTypeById.mockResolvedValue({
      id: TT_ID,
      soldCount: 5,
      maxCapacity: 100,
    });
    mockCreateTicket.mockResolvedValue({ id: "ticket-1" });
    mockIncrementSoldCount.mockResolvedValue(undefined);

    const result = await issueComplimentaryTicketAction(baseForm);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe("ticket-1");

    expect(mockCreateTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        eventId: EVENT_ID,
        ticketTypeId: TT_ID,
        holderName: "VIP Guest",
        holderEmail: "vip@test.com",
        isComplimentary: true,
        issuedBy: "u1",
      }),
    );
    expect(mockIncrementSoldCount).toHaveBeenCalledWith(TENANT_ID, TT_ID);
  });
});
