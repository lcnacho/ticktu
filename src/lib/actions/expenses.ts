"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createAppError, type AppError } from "@/lib/errors/app-error";
import {
  createExpense as createExpenseQuery,
  updateExpense as updateExpenseQuery,
  deleteExpense as deleteExpenseQuery,
  getExpenseById,
} from "@/lib/db/queries/expenses";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import type { ExpenseCategory } from "@/lib/db/schema/expenses";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export async function createExpenseAction(formData: {
  eventId?: string;
  category: ExpenseCategory;
  description: string;
  amountCents: number;
  expenseDate: string;
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

  if (!formData.description?.trim()) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "La descripción es obligatoria",
        400,
        "description",
      ),
    };
  }
  if (formData.amountCents < 1) {
    return {
      success: false,
      error: createAppError(
        "VALIDATION_ERROR",
        "El monto debe ser positivo",
        400,
        "amountCents",
      ),
    };
  }

  const producer = await getProducerByTenantId(tenantId);
  if (!producer) {
    return { success: false, error: createAppError("NOT_FOUND", "Producer not found", 404) };
  }
  const currency = producer.currency;

  const expense = await createExpenseQuery({
    tenantId,
    eventId: formData.eventId || undefined,
    category: formData.category,
    description: formData.description.trim(),
    amountCents: formData.amountCents,
    currency,
    expenseDate: new Date(formData.expenseDate),
  });

  after(async () => {
    if (formData.eventId) {
      revalidateTag(`event-${formData.eventId}`, "default");
    }
  });

  return { success: true, data: { id: expense.id } };
}

export async function updateExpenseAction(
  expenseId: string,
  formData: {
    category?: ExpenseCategory;
    description?: string;
    amountCents?: number;
    eventId?: string;
    expenseDate?: string;
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

  const existing = await getExpenseById(tenantId, expenseId);
  if (!existing) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Expense not found", 404),
    };
  }

  await updateExpenseQuery(tenantId, expenseId, {
    ...(formData.category && { category: formData.category }),
    ...(formData.description && { description: formData.description.trim() }),
    ...(formData.amountCents && { amountCents: formData.amountCents }),
    ...(formData.eventId !== undefined && {
      eventId: formData.eventId || null,
    }),
    ...(formData.expenseDate && {
      expenseDate: new Date(formData.expenseDate),
    }),
  });

  return { success: true, data: { id: expenseId } };
}

export async function deleteExpenseAction(
  expenseId: string,
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

  const deleted = await deleteExpenseQuery(tenantId, expenseId);
  if (!deleted) {
    return {
      success: false,
      error: createAppError("NOT_FOUND", "Expense not found", 404),
    };
  }

  return { success: true, data: { id: expenseId } };
}
