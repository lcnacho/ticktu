"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import {
  createPromoter as createPromoterQuery,
  updatePromoter as updatePromoterQuery,
  createRRPPLink as createRRPPLinkQuery,
  deactivateRRPPLink as deactivateRRPPLinkQuery,
  getLinkByEventAndPromoter,
  getPromoterById,
} from "@/lib/db/queries/rrpp";
import { getEventById } from "@/lib/db/queries/events";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function createPromoterAction(formData: {
  name: string;
  phone?: string;
  email?: string;
}): Promise<ActionResult<{ id: string }>> {
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

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

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

  const promoter = await createPromoterQuery({
    tenantId,
    name: formData.name.trim(),
    phone: formData.phone?.trim() || undefined,
    email: formData.email?.trim() || undefined,
  });

  return { success: true, data: { id: promoter.id } };
}

export async function updatePromoterAction(
  promoterId: string,
  formData: {
    name?: string;
    phone?: string;
    email?: string;
    isActive?: boolean;
  },
): Promise<ActionResult<{ id: string }>> {
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

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

  const existing = await getPromoterById(tenantId, promoterId);
  if (!existing) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Promoter not found", 404),
    };
  }

  await updatePromoterQuery(tenantId, promoterId, {
    ...(formData.name && { name: formData.name.trim() }),
    ...(formData.phone !== undefined && {
      phone: formData.phone.trim() || null,
    }),
    ...(formData.email !== undefined && {
      email: formData.email.trim() || null,
    }),
    ...(formData.isActive !== undefined && { isActive: formData.isActive }),
  });

  return { success: true, data: { id: promoterId } };
}

export async function generateRRPPLinkAction(formData: {
  eventId: string;
  promoterId: string;
}): Promise<ActionResult<{ id: string; code: string }>> {
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

  const existing = await getLinkByEventAndPromoter(
    tenantId,
    formData.eventId,
    formData.promoterId,
  );
  if (existing) {
    return {
      success: false,
      error: createAppError(
        "DUPLICATE",
        "Este promotor ya tiene un link para este evento",
        400,
      ),
    };
  }

  const link = await createRRPPLinkQuery({
    tenantId,
    eventId: formData.eventId,
    promoterId: formData.promoterId,
  });

  after(async () => {
    revalidateTag(`event-${formData.eventId}`, "default");
  });

  return { success: true, data: { id: link.id, code: link.code } };
}

export async function deactivateRRPPLinkAction(
  linkId: string,
): Promise<ActionResult<{ id: string }>> {
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

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return {
      success: false,
      error: createAppError("FORBIDDEN", "No tenant access", 403),
    };
  }

  const result = await deactivateRRPPLinkQuery(tenantId, linkId);
  if (!result) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Link not found", 404),
    };
  }

  return { success: true, data: { id: linkId } };
}
