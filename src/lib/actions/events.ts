"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import {
  createEvent as createEventQuery,
  updateEvent as updateEventQuery,
  getEventById,
  getEventBySlug,
} from "@/lib/db/queries/events";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { slugify } from "@/lib/utils/slugify";
import {
  canTransition,
  getValidTransitions,
} from "@/lib/utils/event-transitions";
import type { EventStatus } from "@/lib/db/schema/events";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function createEventAction(formData: {
  name: string;
  slug?: string;
  date: string;
  venue: string;
  description?: string;
  imageUrl?: string;
}): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: createAppError("UNAUTHORIZED", "Not authenticated", 401),
    };
  }

  // 2. Authorize
  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

  // 3. Validate
  const slug = formData.slug || slugify(formData.name);
  if (!formData.name?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "Event name is required",
        400,
        "name",
      ),
    };
  }
  if (!formData.date) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "Event date is required",
        400,
        "date",
      ),
    };
  }
  if (!formData.venue?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "Venue is required",
        400,
        "venue",
      ),
    };
  }

  // Check slug uniqueness within tenant
  const existing = await getEventBySlug(tenantId, slug);
  if (existing) {
    return {
      success: false,
      error: createAppError(
        "SLUG_TAKEN",
        "This event URL is already in use",
        400,
        "slug",
      ),
    };
  }

  // 4. Execute
  const event = await createEventQuery({
    tenantId,
    name: formData.name.trim(),
    slug,
    date: new Date(formData.date),
    venue: formData.venue.trim(),
    description: formData.description?.trim() || undefined,
    imageUrl: formData.imageUrl || undefined,
  });

  // 5. After (non-blocking)
  after(async () => {
    const producer = await getProducerByTenantId(tenantId);
    if (producer) {
      revalidateTag(`tenant-${producer.slug}`, "default");
    }
  });

  return { success: true, data: { id: event.id } };
}

export async function updateEventAction(
  eventId: string,
  formData: {
    name?: string;
    slug?: string;
    date?: string;
    venue?: string;
    description?: string;
    imageUrl?: string;
  },
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: createAppError("UNAUTHORIZED", "Not authenticated", 401),
    };
  }

  // 2. Authorize
  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

  const event = await getEventById(tenantId, eventId);
  if (!event) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Event not found", 404),
    };
  }

  // 3. Validate
  if (formData.slug && formData.slug !== event.slug) {
    const existing = await getEventBySlug(tenantId, formData.slug);
    if (existing) {
      return {
        success: false,
        error: createAppError(
          "SLUG_TAKEN",
          "This event URL is already in use",
          400,
          "slug",
        ),
      };
    }
  }

  // 4. Execute
  await updateEventQuery(tenantId, eventId, {
    ...(formData.name && { name: formData.name.trim() }),
    ...(formData.slug && { slug: formData.slug }),
    ...(formData.date && { date: new Date(formData.date) }),
    ...(formData.venue && { venue: formData.venue.trim() }),
    ...(formData.description !== undefined && {
      description: formData.description.trim() || null,
    }),
    ...(formData.imageUrl !== undefined && {
      imageUrl: formData.imageUrl || null,
    }),
  });

  // 5. After
  after(async () => {
    const producer = await getProducerByTenantId(tenantId);
    if (producer) {
      revalidateTag(`tenant-${producer.slug}`, "default");
      revalidateTag(`event-${eventId}`, "default");
    }
  });

  return { success: true, data: { id: eventId } };
}

// Event cancellation (Story 8.2)

export async function cancelEventAction(
  eventId: string,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: createAppError("UNAUTHORIZED", "Not authenticated", 401),
    };
  }

  // 2. Authorize
  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

  const event = await getEventById(tenantId, eventId);
  if (!event) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Event not found", 404),
    };
  }

  // 3. Validate
  if (!["published", "finished"].includes(event.status)) {
    return {
      success: false,
      error: createAppError(
        "INVALID_STATE_TRANSITION",
        "Solo se pueden cancelar eventos publicados o finalizados",
        400,
      ),
    };
  }

  // 4. Execute
  await updateEventQuery(tenantId, eventId, { status: "cancelled" });

  // 5. After — dispatch Inngest event for refund processing
  after(async () => {
    const { inngestClient } = await import("@/lib/inngest/client");
    await inngestClient.send({
      name: "event/cancelled",
      data: { eventId, tenantId },
    });
    const producer = await getProducerByTenantId(tenantId);
    if (producer) {
      revalidateTag(`tenant-${producer.slug}`, "default");
      revalidateTag(`event-${eventId}`, "default");
    }
  });

  return { success: true, data: { id: eventId } };
}

// Lifecycle transitions (Story 2.5)

export async function publishEventAction(
  eventId: string,
): Promise<ActionResult<{ id: string }>> {
  return transitionEvent(eventId, "published");
}

export async function finishEventAction(
  eventId: string,
): Promise<ActionResult<{ id: string }>> {
  return transitionEvent(eventId, "finished");
}

export async function archiveEventAction(
  eventId: string,
): Promise<ActionResult<{ id: string }>> {
  return transitionEvent(eventId, "archived");
}

async function transitionEvent(
  eventId: string,
  targetStatus: EventStatus,
): Promise<ActionResult<{ id: string }>> {
  // 1. Auth
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      error: createAppError("UNAUTHORIZED", "Not authenticated", 401),
    };
  }

  // 2. Authorize
  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

  const event = await getEventById(tenantId, eventId);
  if (!event) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Event not found", 404),
    };
  }

  // 3. Validate
  if (!canTransition(event.status as EventStatus, targetStatus)) {
    const validNext = getValidTransitions(event.status as EventStatus);
    return {
      success: false,
      error: createAppError(
        "INVALID_STATE_TRANSITION",
        `Cannot transition from ${event.status} to ${targetStatus}. Valid transitions: ${validNext.join(", ") || "none"}`,
        400,
      ),
    };
  }

  // 4. Execute
  await updateEventQuery(tenantId, eventId, { status: targetStatus });

  // 5. After
  after(async () => {
    const producer = await getProducerByTenantId(tenantId);
    if (producer) {
      revalidateTag(`tenant-${producer.slug}`, "default");
      revalidateTag(`event-${eventId}`, "default");
    }
  });

  return { success: true, data: { id: eventId } };
}
