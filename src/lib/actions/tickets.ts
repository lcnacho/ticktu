"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import { getEventById } from "@/lib/db/queries/events";
import { getTicketTypeById } from "@/lib/db/queries/ticket-types";
import {
  createTicket,
  incrementTicketTypeSoldCount,
} from "@/lib/db/queries/tickets";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function issueComplimentaryTicketAction(formData: {
  eventId: string;
  ticketTypeId: string;
  holderName: string;
  holderEmail: string;
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

  const ticketType = await getTicketTypeById(tenantId, formData.ticketTypeId);
  if (!ticketType) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Ticket type not found", 404),
    };
  }

  // 3. Validate
  if (!formData.holderName?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El nombre es obligatorio",
        400,
        "holderName",
      ),
    };
  }
  if (!formData.holderEmail?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El email es obligatorio",
        400,
        "holderEmail",
      ),
    };
  }

  if (ticketType.soldCount >= ticketType.maxCapacity) {
    return {
      success: false,
      error: createAppError(
        "CAPACITY_EXCEEDED",
        "No hay capacidad disponible para este tipo de entrada",
        400,
      ),
    };
  }

  // 4. Execute
  const ticket = await createTicket({
    tenantId,
    eventId: formData.eventId,
    ticketTypeId: formData.ticketTypeId,
    holderName: formData.holderName.trim(),
    holderEmail: formData.holderEmail.trim(),
    isComplimentary: true,
    issuedBy: user.id,
  });

  await incrementTicketTypeSoldCount(tenantId, formData.ticketTypeId);

  // 5. After — dispatch Inngest event for QR generation & email
  after(async () => {
    revalidateTag(`event-${formData.eventId}`, "default");
    // TODO: inngest.send({ name: "ticket/complimentary-issued", data: { ticketId: ticket.id, tenantId } })
  });

  return { success: true, data: { id: ticket.id } };
}
