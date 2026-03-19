"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createPromoterAction, updatePromoterAction } from "@/lib/actions/rrpp";
import type { RRPPPromoter } from "@/lib/db/schema/rrpp";

const promoterSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional(),
  email: z.string().email("Email invalido").optional().or(z.literal("")),
});

type PromoterFormData = z.infer<typeof promoterSchema>;

type PromoterDialogProps = {
  open: boolean;
  onClose: () => void;
  editingPromoter?: RRPPPromoter;
};

export function PromoterDialog({
  open,
  onClose,
  editingPromoter,
}: PromoterDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromoterFormData>({
    resolver: zodResolver(promoterSchema),
    defaultValues: {
      name: editingPromoter?.name ?? "",
      phone: editingPromoter?.phone ?? "",
      email: editingPromoter?.email ?? "",
    },
  });

  async function onSubmit(data: PromoterFormData) {
    setIsSubmitting(true);

    const result = editingPromoter
      ? await updatePromoterAction(editingPromoter.id, {
          name: data.name,
          phone: data.phone || undefined,
          email: data.email || undefined,
        })
      : await createPromoterAction({
          name: data.name,
          phone: data.phone || undefined,
          email: data.email || undefined,
        });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(editingPromoter ? "Promotor actualizado" : "Promotor creado");
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
        <h2 className="mb-4 text-lg font-semibold">
          {editingPromoter ? "Editar promotor" : "Nuevo promotor"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="promoter-name" className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              id="promoter-name"
              type="text"
              {...register("name")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="promoter-phone" className="block text-sm font-medium text-gray-700">
              Telefono
            </label>
            <input
              id="promoter-phone"
              type="tel"
              {...register("phone")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="promoter-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="promoter-email"
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
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
              {isSubmitting ? "Guardando..." : editingPromoter ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
