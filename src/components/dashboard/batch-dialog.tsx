"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createBatchAction } from "@/lib/actions/batches";

const batchSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  activatesAt: z.string().min(1, "La fecha de activacion es obligatoria"),
});

type BatchFormData = z.infer<typeof batchSchema>;

type BatchDialogProps = {
  ticketTypeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BatchDialog({
  ticketTypeId,
  open,
  onOpenChange,
}: BatchDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: { name: "", quantity: 50, activatesAt: "" },
  });

  async function onSubmit(data: BatchFormData) {
    setIsSubmitting(true);

    const result = await createBatchAction({
      ticketTypeId,
      name: data.name,
      quantity: data.quantity,
      activatesAt: data.activatesAt,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Lote creado exitosamente");
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
        <h2 className="mb-4 text-lg font-semibold">Nuevo lote</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="batch-name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre *
            </label>
            <input
              id="batch-name"
              type="text"
              {...register("name")}
              placeholder="Ej: Early Bird, Segunda tanda"
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
              htmlFor="batch-quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Cantidad *
            </label>
            <input
              id="batch-quantity"
              type="number"
              min={1}
              {...register("quantity", { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="batch-activatesAt"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha de activacion *
            </label>
            <input
              id="batch-activatesAt"
              type="datetime-local"
              {...register("activatesAt")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.activatesAt && (
              <p className="mt-1 text-sm text-red-600">
                {errors.activatesAt.message}
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
              {isSubmitting ? "Creando..." : "Crear lote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
