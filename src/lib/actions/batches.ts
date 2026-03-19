"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import { getTicketTypeById } from "@/lib/db/queries/ticket-types";
import {
  createBatch as createBatchQuery,
  getTotalBatchQuantity,
} from "@/lib/db/queries/batches";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function createBatchAction(formData: {
  ticketTypeId: string;
  name: string;
  quantity: number;
  activatesAt: string;
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

  const ticketType = await getTicketTypeById(tenantId, formData.ticketTypeId);
  if (!ticketType) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Ticket type not found", 404),
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
  if (formData.quantity < 1) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "La cantidad debe ser al menos 1",
        400,
        "quantity",
      ),
    };
  }

  const currentTotal = await getTotalBatchQuantity(
    tenantId,
    formData.ticketTypeId,
  );
  if (currentTotal + formData.quantity > ticketType.maxCapacity) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        `La cantidad total de lotes (${currentTotal + formData.quantity}) excederia la capacidad del tipo de entrada (${ticketType.maxCapacity})`,
        400,
        "quantity",
      ),
    };
  }

  // 4. Execute
  const batch = await createBatchQuery({
    tenantId,
    ticketTypeId: formData.ticketTypeId,
    name: formData.name.trim(),
    quantity: formData.quantity,
    activatesAt: new Date(formData.activatesAt),
  });

  // 5. After
  after(async () => {
    revalidateTag(`event-${ticketType.eventId}`, "default");
  });

  return { success: true, data: { id: batch.id } };
}
