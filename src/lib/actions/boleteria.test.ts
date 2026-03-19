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
vi.mock("@/lib/db/queries/events", () => ({
  getEventById: vi.fn(),
}));
vi.mock("@/lib/db/queries/ticket-types", () => ({
  getTicketTypeById: vi.fn(),
}));
vi.mock("@/lib/db/queries/producers", () => ({
  getProducerByTenantId: vi.fn(),
}));
vi.mock("@/lib/db/queries/orders", () => ({
  atomicIncrementSoldCount: vi.fn(),
}));

// Track transaction calls
const txInsertReturning = vi.fn();
const txInsertValues = vi.fn(() => ({ returning: txInsertReturning }));
const txInsert = vi.fn(() => ({ values: txInsertValues }));
const txUpdateSetWhere = vi.fn();
const txUpdateSet = vi.fn(() => ({ where: txUpdateSetWhere }));
const txUpdate = vi.fn(() => ({ set: txUpdateSet }));

const mockTx = {
  insert: txInsert,
  update: txUpdate,
};

const mockTransaction = vi.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
  return fn(mockTx);
});

vi.mock("@/lib/db/index", () => ({
  db: { transaction: (...args: unknown[]) => mockTransaction(...args as [never]) },
}));

// Import after mocks
import { createBoleteriaOrderAction } from "./boleteria";
import { getEventById } from "@/lib/db/queries/events";
import { getTicketTypeById } from "@/lib/db/queries/ticket-types";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { atomicIncrementSoldCount } from "@/lib/db/queries/orders";

const TENANT_ID = "tenant-1";
const EVENT_ID = "event-1";
const TT_ID = "tt-1";
const ORDER_ID = "order-1";

function setupHappyPath() {
  mockGetUser.mockResolvedValue({
    data: { user: { id: "u1", app_metadata: { tenant_id: TENANT_ID } } },
  });
  vi.mocked(getEventById).mockResolvedValue({
    id: EVENT_ID,
    name: "Test",
    slug: "test",
    date: new Date(),
    venue: "V",
    status: "published",
  } as never);
  vi.mocked(getTicketTypeById).mockResolvedValue({
    id: TT_ID,
    price: 1000,
    isActive: true,
    name: "General",
  } as never);
  vi.mocked(atomicIncrementSoldCount).mockResolvedValue(true);
  vi.mocked(getProducerByTenantId).mockResolvedValue({
    currency: "UYU",
    feePercentage: 5,
    feeFixed: 0,
  } as never);

  txInsertReturning.mockResolvedValue([{ id: ORDER_ID }]);
  txInsertValues.mockReturnValue({ returning: txInsertReturning });
  // For inserts that don't call returning (orderItems, tickets)
  txInsertValues.mockImplementation(((values: unknown) => {
    const result = { returning: txInsertReturning };
    // If values is an array (orderItems or tickets bulk insert), resolve without returning
    if (Array.isArray(values) && values.length > 0 && !('buyerName' in values[0])) {
      return Promise.resolve() as never;
    }
    return result as never;
  }) as never);
}

const baseFormData = {
  eventId: EVENT_ID,
  ticketTypeId: TT_ID,
  quantity: 3,
  buyerName: "Juan Perez",
  buyerEmail: "juan@test.com",
  paymentMethod: "cash" as const,
};

describe("createBoleteriaOrderAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UNAUTHORIZED when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await createBoleteriaOrderAction(baseFormData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("UNAUTHORIZED");
  });

  it("returns FORBIDDEN when no tenant_id", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: {} } },
    });
    const result = await createBoleteriaOrderAction(baseFormData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });

  it("returns VALIDATION_ERROR when buyerName is empty", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { tenant_id: TENANT_ID } } },
    });
    const result = await createBoleteriaOrderAction({ ...baseFormData, buyerName: "  " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("uses a database transaction for order + items + tickets + status", async () => {
    setupHappyPath();
    const result = await createBoleteriaOrderAction(baseFormData);

    expect(result.success).toBe(true);
    expect(mockTransaction).toHaveBeenCalledOnce();
  });

  it("creates tickets with unique QR codes for each item", async () => {
    setupHappyPath();

    // Override txInsert to capture ticket values
    const ticketInserts: unknown[] = [];
    txInsert.mockImplementation(((table: unknown) => ({
      values: (vals: unknown) => {
        if (Array.isArray(vals) && vals.length > 0 && 'qrCode' in (vals[0] as Record<string, unknown>)) {
          ticketInserts.push(...(vals as unknown[]));
          return Promise.resolve();
        }
        if (Array.isArray(vals) && vals.length > 0 && 'unitPrice' in (vals[0] as Record<string, unknown>)) {
          return Promise.resolve();
        }
        return { returning: () => Promise.resolve([{ id: ORDER_ID }]) };
      },
    })) as never);

    await createBoleteriaOrderAction(baseFormData);

    expect(ticketInserts).toHaveLength(3);
    const qrCodes = new Set((ticketInserts as { qrCode: string }[]).map((t) => t.qrCode));
    const qrHashes = new Set((ticketInserts as { qrHash: string }[]).map((t) => t.qrHash));
    expect(qrCodes.size).toBe(3);
    expect(qrHashes.size).toBe(3);

    for (const ticket of ticketInserts as Record<string, unknown>[]) {
      expect(ticket.orderId).toBe(ORDER_ID);
      expect(ticket.isComplimentary).toBe(false);
      expect(ticket.tenantId).toBe(TENANT_ID);
      expect(ticket.eventId).toBe(EVENT_ID);
      expect(ticket.ticketTypeId).toBe(TT_ID);
      expect(ticket.holderName).toBe("Juan Perez");
      expect(ticket.holderEmail).toBe("juan@test.com");
    }
  });

  it("returns CAPACITY_EXCEEDED when soldCount increment fails", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "u1", app_metadata: { tenant_id: TENANT_ID } } },
    });
    vi.mocked(getEventById).mockResolvedValue({ id: EVENT_ID } as never);
    vi.mocked(getTicketTypeById).mockResolvedValue({ id: TT_ID, price: 1000, isActive: true } as never);
    vi.mocked(getProducerByTenantId).mockResolvedValue({ currency: "UYU" } as never);
    vi.mocked(atomicIncrementSoldCount).mockResolvedValue(false);

    const result = await createBoleteriaOrderAction(baseFormData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("CAPACITY_EXCEEDED");
    // Capacity check is now inside the transaction — transaction is called but rolls back
    expect(mockTransaction).toHaveBeenCalledOnce();
  });

  it("defaults buyerEmail to boleteria@ticktu.com when not provided", async () => {
    setupHappyPath();

    const orderInserts: unknown[] = [];
    txInsert.mockImplementation((() => ({
      values: (vals: unknown) => {
        if (!Array.isArray(vals)) {
          orderInserts.push(vals);
          return { returning: () => Promise.resolve([{ id: ORDER_ID }]) };
        }
        return Promise.resolve();
      },
    })) as never);

    await createBoleteriaOrderAction({ ...baseFormData, buyerEmail: undefined });

    expect(orderInserts).toHaveLength(1);
    expect((orderInserts[0] as Record<string, unknown>).buyerEmail).toBe("boleteria@ticktu.com");
  });
});
