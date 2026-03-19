"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createExpenseAction } from "@/lib/actions/expenses";
import type { Event } from "@/lib/db/schema/events";

const CATEGORIES = [
  { value: "venue", label: "Venue" },
  { value: "djs", label: "DJs" },
  { value: "security", label: "Seguridad" },
  { value: "marketing", label: "Marketing" },
  { value: "staff", label: "Staff" },
  { value: "production", label: "Produccion" },
  { value: "other", label: "Otro" },
] as const;

const expenseSchema = z.object({
  eventId: z.string().optional(),
  category: z.enum(["venue", "djs", "security", "marketing", "staff", "production", "other"]),
  description: z.string().min(1, "La descripcion es obligatoria"),
  amount: z.string().min(1, "El monto es obligatorio"),
  expenseDate: z.string().min(1, "La fecha es obligatoria"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

type ExpenseDialogProps = {
  open: boolean;
  onClose: () => void;
  events: Event[];
};

export function ExpenseDialog({ open, onClose, events }: ExpenseDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      eventId: "",
      category: "other",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(data: ExpenseFormData) {
    setIsSubmitting(true);

    const amountCents = Math.round(parseFloat(data.amount) * 100);
    if (isNaN(amountCents) || amountCents < 1) {
      toast.error("Monto invalido");
      setIsSubmitting(false);
      return;
    }

    const result = await createExpenseAction({
      eventId: data.eventId || undefined,
      category: data.category,
      description: data.description,
      amountCents,
      expenseDate: data.expenseDate,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Gasto registrado");
      reset();
      onClose();
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Registrar gasto</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="expense-event" className="block text-sm font-medium text-gray-700">
              Evento (opcional)
            </label>
            <select
              id="expense-event"
              {...register("eventId")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">General (sin evento)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700">
              Categoria *
            </label>
            <select
              id="expense-category"
              {...register("category")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-desc" className="block text-sm font-medium text-gray-700">
              Descripcion *
            </label>
            <input
              id="expense-desc"
              type="text"
              {...register("description")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700">
              Monto *
            </label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              {...register("amount")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700">
              Fecha *
            </label>
            <input
              id="expense-date"
              type="date"
              {...register("expenseDate")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.expenseDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expenseDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
