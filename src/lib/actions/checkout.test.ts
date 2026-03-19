import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock next/server and next/cache
vi.mock("next/server", () => ({
  after: (fn: () => void) => fn(),
}));
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

// Mock query modules
const mockGetProducerBySlug = vi.fn();
vi.mock("@/lib/db/queries/producers", () => ({
  getProducerBySlug: (...args: unknown[]) => mockGetProducerBySlug(...args),
}));

const mockGetTicketTypeById = vi.fn();
vi.mock("@/lib/db/queries/ticket-types", () => ({
  getTicketTypeById: (...args: unknown[]) => mockGetTicketTypeById(...args),
}));

const mockAtomicIncrementSoldCount = vi.fn();
const mockUpdateOrderStatus = vi.fn();
vi.mock("@/lib/db/queries/orders", () => ({
  atomicIncrementSoldCount: (...args: unknown[]) =>
    mockAtomicIncrementSoldCount(...args),
  updateOrderStatus: (...args: unknown[]) => mockUpdateOrderStatus(...args),
}));

const mockGetLinkByCode = vi.fn();
vi.mock("@/lib/db/queries/rrpp", () => ({
  getLinkByCode: (...args: unknown[]) => mockGetLinkByCode(...args),
}));

const mockCreatePreference = vi.fn();
vi.mock("@/lib/payments/mercadopago-client", () => ({
  mercadopagoAdapter: {
    createPreference: (...args: unknown[]) => mockCreatePreference(...args),
  },
}));

// Mock db transaction — tx mimics insert().values() and insert().values().returning()
const mockTxInsert = vi.fn();
function setupTxMock(orderId: string) {
  let callCount = 0;
  mockTxInsert.mockImplementation(() => ({
    values: vi.fn(() => {
      callCount++;
      if (callCount === 1) {
        // First insert: orders — has .returning()
        return { returning: vi.fn().mockResolvedValue([{ id: orderId }]) };
      }
      // Second insert: orderItems — no .returning(), just awaited
      return Promise.resolve([]);
    }),
  }));
}
const mockTx = { insert: mockTxInsert };

vi.mock("@/lib/db/index", () => ({
  db: {
    transaction: async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
      try {
        return await fn(mockTx);
      } catch (err) {
        throw err;
      }
    },
  },
}));

vi.mock("@/lib/db/schema/orders", () => ({
  orders: { id: "id", tenantId: "tenantId" },
}));
vi.mock("@/lib/db/schema/order-items", () => ({
  orderItems: {},
}));

// Import after mocks
import { createCheckoutAction } from "./checkout";

const TENANT_ID = "tenant-1";
const PRODUCER_SLUG = "cool-events";
const EVENT_ID = "event-1";
const TT_ID = "tt-general";
const ORDER_ID = "order-checkout-1";

const baseProducer = {
  tenantId: TENANT_ID,
  slug: PRODUCER_SLUG,
  feePercentage: 10,
  feeFixed: 50,
  currency: "UYU",
};

const baseTicketType = {
  id: TT_ID,
  price: 2000,
  isActive: true,
  name: "General",
};

const baseFormData = {
  producerSlug: PRODUCER_SLUG,
  eventId: EVENT_ID,
  buyerName: "Maria Garcia",
  buyerEmail: "maria@test.com",
  items: [
    {
      ticketTypeId: TT_ID,
      holderName: "Maria Garcia",
      holderEmail: "maria@test.com",
    },
  ],
};

function setupHappyPath() {
  mockGetProducerBySlug.mockResolvedValue(baseProducer);
  mockGetTicketTypeById.mockResolvedValue(baseTicketType);
  mockAtomicIncrementSoldCount.mockResolvedValue(true);
  setupTxMock(ORDER_ID);
  mockCreatePreference.mockResolvedValue({
    preferenceId: "pref-123",
    initPoint: "https://mp.com/checkout/pref-123",
  });
  mockUpdateOrderStatus.mockResolvedValue(undefined);
}

describe("createCheckoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns NOT_FOUND when producer slug is invalid", async () => {
    mockGetProducerBySlug.mockResolvedValue(null);

    const result = await createCheckoutAction(baseFormData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("returns VALIDATION_ERROR when items array is empty", async () => {
    mockGetProducerBySlug.mockResolvedValue(baseProducer);

    const result = await createCheckoutAction({
      ...baseFormData,
      items: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns VALIDATION_ERROR when buyerName is empty", async () => {
    mockGetProducerBySlug.mockResolvedValue(baseProducer);

    const result = await createCheckoutAction({
      ...baseFormData,
      buyerName: "  ",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns VALIDATION_ERROR when buyerEmail is empty", async () => {
    mockGetProducerBySlug.mockResolvedValue(baseProducer);

    const result = await createCheckoutAction({
      ...baseFormData,
      buyerEmail: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns NOT_FOUND when ticket type is inactive", async () => {
    mockGetProducerBySlug.mockResolvedValue(baseProducer);
    mockGetTicketTypeById.mockResolvedValue({ ...baseTicketType, isActive: false });

    const result = await createCheckoutAction(baseFormData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("returns CAPACITY_EXCEEDED when soldCount increment fails", async () => {
    mockGetProducerBySlug.mockResolvedValue(baseProducer);
    mockGetTicketTypeById.mockResolvedValue(baseTicketType);
    mockAtomicIncrementSoldCount.mockResolvedValue(false);

    const result = await createCheckoutAction(baseFormData);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("CAPACITY_EXCEEDED");
  });

  it("creates order, items, and MP preference on happy path", async () => {
    setupHappyPath();

    const result = await createCheckoutAction(baseFormData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.redirectUrl).toBe("https://mp.com/checkout/pref-123");
      expect(result.data.orderId).toBe(ORDER_ID);
    }

    // tx.insert called twice: orders + orderItems
    expect(mockTxInsert).toHaveBeenCalledTimes(2);
    expect(mockCreatePreference).toHaveBeenCalledOnce();
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
      TENANT_ID,
      ORDER_ID,
      expect.objectContaining({ mercadopagoPreferenceId: "pref-123" }),
    );
  });

  it("resolves RRPP attribution when valid code provided", async () => {
    setupHappyPath();
    mockGetLinkByCode.mockResolvedValue({
      id: "link-1",
      tenantId: TENANT_ID,
    });

    await createCheckoutAction({ ...baseFormData, rrppRef: "PROMO123" });

    expect(mockGetLinkByCode).toHaveBeenCalledWith("PROMO123");
  });

  it("ignores RRPP code from different tenant", async () => {
    setupHappyPath();
    mockGetLinkByCode.mockResolvedValue({
      id: "link-other",
      tenantId: "other-tenant",
    });

    const result = await createCheckoutAction({ ...baseFormData, rrppRef: "BADCODE" });
    expect(result.success).toBe(true);
  });
});
