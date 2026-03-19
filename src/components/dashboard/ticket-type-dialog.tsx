"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createTicketTypeAction,
  updateTicketTypeAction,
} from "@/lib/actions/ticket-types";
import type { TicketType } from "@/lib/db/schema/ticket-types";
import { calculateServiceFee, formatMoney } from "@/lib/utils/money";

const ticketTypeSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, "El precio no puede ser negativo"),
  maxCapacity: z.number().min(1, "La capacidad debe ser al menos 1"),
});

type TicketTypeFormData = z.infer<typeof ticketTypeSchema>;

type TicketTypeDialogProps = {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingType: TicketType | null;
  currency: string;
  feePercentage: number;
  feeFixed: number;
};

export function TicketTypeDialog({
  eventId,
  open,
  onOpenChange,
  editingType,
  currency,
  feePercentage,
  feeFixed,
}: TicketTypeDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketTypeFormData>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: editingType
      ? {
          name: editingType.name,
          description: editingType.description ?? "",
          price: editingType.price,
          maxCapacity: editingType.maxCapacity,
        }
      : { name: "", description: "", price: 0, maxCapacity: 100 },
  });

  const watchPrice = watch("price");
  const priceCents = Number(watchPrice) || 0;
  const fee = calculateServiceFee(priceCents, feePercentage, feeFixed);

  async function onSubmit(data: TicketTypeFormData) {
    setIsSubmitting(true);

    const result = editingType
      ? await updateTicketTypeAction(editingType.id, {
          name: data.name,
          description: data.description || undefined,
          price: data.price,
          maxCapacity: data.maxCapacity,
        })
      : await createTicketTypeAction({
          eventId,
          name: data.name,
          description: data.description || undefined,
          price: data.price,
          maxCapacity: data.maxCapacity,
        });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(
        editingType
          ? "Tipo de entrada actualizado"
          : "Tipo de entrada creado",
      );
      reset();
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">
          {editingType ? "Editar tipo de entrada" : "Nuevo tipo de entrada"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="tt-name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre *
            </label>
            <input
              id="tt-name"
              type="text"
              {...register("name")}
              placeholder="Ej: General, VIP"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="tt-description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripcion
            </label>
            <textarea
              id="tt-description"
              rows={2}
              {...register("description")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="tt-price"
              className="block text-sm font-medium text-gray-700"
            >
              Precio (centavos) *
            </label>
            <input
              id="tt-price"
              type="number"
              min={0}
              {...register("price", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price.message}
              </p>
            )}
            {priceCents > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                Comprador paga: {formatMoney(priceCents + fee, currency)} (
                {formatMoney(priceCents, currency)} +{" "}
                {formatMoney(fee, currency)} cargo por servicio)
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="tt-capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Capacidad maxima *
            </label>
            <input
              id="tt-capacity"
              type="number"
              min={1}
              {...register("maxCapacity", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.maxCapacity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxCapacity.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
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
              {isSubmitting
                ? "Guardando..."
                : editingType
                  ? "Guardar cambios"
                  : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
