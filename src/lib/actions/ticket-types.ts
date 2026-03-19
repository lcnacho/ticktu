"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import { getEventById } from "@/lib/db/queries/events";
import {
  createTicketType as createTicketTypeQuery,
  updateTicketType as updateTicketTypeQuery,
  getTicketTypeById,
} from "@/lib/db/queries/ticket-types";
import { getProducerByTenantId } from "@/lib/db/queries/producers";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function createTicketTypeAction(formData: {
  eventId: string;
  name: string;
  description?: string;
  price: number;
  maxCapacity: number;
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

  const event = await getEventById(tenantId, formData.eventId);
  if (!event) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Event not found", 404),
    };
  }

  // 3. Validate
  if (!formData.name?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El nombre es obligatorio",
        400,
        "name",
      ),
    };
  }
  if (formData.price < 0) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El precio no puede ser negativo",
        400,
        "price",
      ),
    };
  }
  if (formData.maxCapacity < 1) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "La capacidad debe ser al menos 1",
        400,
        "maxCapacity",
      ),
    };
  }

  // 4. Execute
  const tt = await createTicketTypeQuery({
    tenantId,
    eventId: formData.eventId,
    name: formData.name.trim(),
    description: formData.description?.trim() || undefined,
    price: formData.price,
    maxCapacity: formData.maxCapacity,
  });

  // 5. After
  after(async () => {
    revalidateTag(`event-${formData.eventId}`, "default");
  });

  return { success: true, data: { id: tt.id } };
}

export async function updateTicketTypeAction(
  ticketTypeId: string,
  formData: {
    name?: string;
    description?: string;
    price?: number;
    maxCapacity?: number;
    isActive?: boolean;
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

  const existing = await getTicketTypeById(tenantId, ticketTypeId);
  if (!existing) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Ticket type not found", 404),
    };
  }

  // 3. Validate
  if (
    formData.maxCapacity !== undefined &&
    formData.maxCapacity < existing.soldCount
  ) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        `La capacidad no puede ser menor que las entradas ya vendidas (${existing.soldCount} vendidas)`,
        400,
        "maxCapacity",
      ),
    };
  }

  // 4. Execute
  await updateTicketTypeQuery(tenantId, ticketTypeId, {
    ...(formData.name && { name: formData.name.trim() }),
    ...(formData.description !== undefined && {
      description: formData.description.trim() || null,
    }),
    ...(formData.price !== undefined && { price: formData.price }),
    ...(formData.maxCapacity !== undefined && {
      maxCapacity: formData.maxCapacity,
    }),
    ...(formData.isActive !== undefined && { isActive: formData.isActive }),
  });

  // 5. After
  after(async () => {
    revalidateTag(`event-${existing.eventId}`, "default");
  });

  return { success: true, data: { id: ticketTypeId } };
}
