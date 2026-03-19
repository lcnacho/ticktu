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
const mockCreateEventQuery = vi.fn();
const mockUpdateEventQuery = vi.fn();
const mockGetEventById = vi.fn();
const mockGetEventBySlug = vi.fn();
vi.mock("@/lib/db/queries/events", () => ({
  createEvent: (...args: unknown[]) => mockCreateEventQuery(...args),
  updateEvent: (...args: unknown[]) => mockUpdateEventQuery(...args),
  getEventById: (...args: unknown[]) => mockGetEventById(...args),
  getEventBySlug: (...args: unknown[]) => mockGetEventBySlug(...args),
}));

vi.mock("@/lib/db/queries/producers", () => ({
  getProducerByTenantId: vi.fn().mockResolvedValue({ slug: "test-producer" }),
}));

vi.mock("@/lib/inngest/client", () => ({
  inngestClient: { send: vi.fn() },
}));

// Import after mocks
import {
  createEventAction,
  updateEventAction,
  publishEventAction,
  finishEventAction,
  archiveEventAction,
  cancelEventAction,
} from "./events";

const TENANT_ID = "tenant-1";
const EVENT_ID = "event-1";

function mockAuth(tenantId: string | null = TENANT_ID) {
  mockGetUser.mockResolvedValue({
    data: {
      user: {
        id: "u1",
        app_metadata: tenantId ? { tenant_id: tenantId } : {},
      },
    },
  });
}

function mockNoAuth() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
}

const baseCreateForm = {
  name: "Summer Party",
  date: "2026-07-15",
  venue: "Beach Club",
  description: "Best party ever",
};

describe("createEventAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns UNAUTHORIZED when no user", async () => {
    mockNoAuth();
    const result = await createEventAction(baseCreateForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("UNAUTHORIZED");
  });

  it("returns FORBIDDEN when no tenant_id", async () => {
    mockAuth(null);
    const result = await createEventAction(baseCreateForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("FORBIDDEN");
  });

  it("returns VALIDATION_ERROR when name is empty", async () => {
    mockAuth();
    const result = await createEventAction({ ...baseCreateForm, name: "  " });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.field).toBe("name");
    }
  });

  it("returns VALIDATION_ERROR when date is missing", async () => {
    mockAuth();
    const result = await createEventAction({ ...baseCreateForm, date: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.field).toBe("date");
  });

  it("returns VALIDATION_ERROR when venue is empty", async () => {
    mockAuth();
    const result = await createEventAction({ ...baseCreateForm, venue: "  " });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.field).toBe("venue");
  });

  it("returns SLUG_TAKEN when slug already exists", async () => {
    mockAuth();
    mockGetEventBySlug.mockResolvedValue({ id: "existing" });

    const result = await createEventAction(baseCreateForm);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("SLUG_TAKEN");
  });

  it("creates event on happy path", async () => {
    mockAuth();
    mockGetEventBySlug.mockResolvedValue(null);
    mockCreateEventQuery.mockResolvedValue({ id: EVENT_ID });

    const result = await createEventAction(baseCreateForm);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.id).toBe(EVENT_ID);
    expect(mockCreateEventQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT_ID,
        name: "Summer Party",
        venue: "Beach Club",
      }),
    );
  });
});

describe("updateEventAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns NOT_FOUND when event does not exist", async () => {
    mockAuth();
    mockGetEventById.mockResolvedValue(null);

    const result = await updateEventAction(EVENT_ID, { name: "New Name" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("NOT_FOUND");
  });

  it("returns SLUG_TAKEN when new slug conflicts", async () => {
    mockAuth();
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, slug: "old-slug" });
    mockGetEventBySlug.mockResolvedValue({ id: "other-event" });

    const result = await updateEventAction(EVENT_ID, { slug: "taken-slug" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("SLUG_TAKEN");
  });

  it("updates event on happy path", async () => {
    mockAuth();
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, slug: "old-slug" });
    mockUpdateEventQuery.mockResolvedValue(undefined);

    const result = await updateEventAction(EVENT_ID, { name: "Updated" });
    expect(result.success).toBe(true);
    expect(mockUpdateEventQuery).toHaveBeenCalledWith(
      TENANT_ID,
      EVENT_ID,
      expect.objectContaining({ name: "Updated" }),
    );
  });
});

describe("event lifecycle transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth();
  });

  it("publishes a draft event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "draft" });
    mockUpdateEventQuery.mockResolvedValue(undefined);

    const result = await publishEventAction(EVENT_ID);
    expect(result.success).toBe(true);
    expect(mockUpdateEventQuery).toHaveBeenCalledWith(
      TENANT_ID,
      EVENT_ID,
      { status: "published" },
    );
  });

  it("rejects publishing a finished event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "finished" });

    const result = await publishEventAction(EVENT_ID);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.code).toBe("INVALID_STATE_TRANSITION");
  });

  it("finishes a published event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "published" });
    mockUpdateEventQuery.mockResolvedValue(undefined);

    const result = await finishEventAction(EVENT_ID);
    expect(result.success).toBe(true);
  });

  it("archives a finished event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "finished" });
    mockUpdateEventQuery.mockResolvedValue(undefined);

    const result = await archiveEventAction(EVENT_ID);
    expect(result.success).toBe(true);
  });

  it("rejects archiving a draft event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "draft" });

    const result = await archiveEventAction(EVENT_ID);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.code).toBe("INVALID_STATE_TRANSITION");
  });
});

describe("cancelEventAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth();
  });

  it("cancels a published event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "published" });
    mockUpdateEventQuery.mockResolvedValue(undefined);

    const result = await cancelEventAction(EVENT_ID);
    expect(result.success).toBe(true);
  });

  it("cancels a finished event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "finished" });
    mockUpdateEventQuery.mockResolvedValue(undefined);

    const result = await cancelEventAction(EVENT_ID);
    expect(result.success).toBe(true);
  });

  it("rejects cancelling a draft event", async () => {
    mockGetEventById.mockResolvedValue({ id: EVENT_ID, status: "draft" });

    const result = await cancelEventAction(EVENT_ID);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.code).toBe("INVALID_STATE_TRANSITION");
  });
});
