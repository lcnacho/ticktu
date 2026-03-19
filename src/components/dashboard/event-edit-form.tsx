"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateEventAction } from "@/lib/actions/events";

const editEventSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  slug: z.string().min(1, "El slug es obligatorio").max(200),
  date: z.string().min(1, "La fecha es obligatoria"),
  venue: z.string().min(1, "El lugar es obligatorio").max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.url("URL invalida").optional().or(z.literal("")),
});

type EditEventFormData = z.infer<typeof editEventSchema>;

type EventEditFormProps = {
  eventId: string;
  defaultValues: EditEventFormData;
};

export function EventEditForm({ eventId, defaultValues }: EventEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues,
  });

  async function onSubmit(data: EditEventFormData) {
    setIsSubmitting(true);

    const result = await updateEventAction(eventId, {
      name: data.name,
      slug: data.slug,
      date: data.date,
      venue: data.venue,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Evento actualizado exitosamente");
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="edit-name"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre del evento *
        </label>
        <input
          id="edit-name"
          type="text"
          {...register("name")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-slug"
          className="block text-sm font-medium text-gray-700"
        >
          URL del evento *
        </label>
        <input
          id="edit-slug"
          type="text"
          {...register("slug")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-date"
          className="block text-sm font-medium text-gray-700"
        >
          Fecha y hora *
        </label>
        <input
          id="edit-date"
          type="datetime-local"
          {...register("date")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-venue"
          className="block text-sm font-medium text-gray-700"
        >
          Lugar *
        </label>
        <input
          id="edit-venue"
          type="text"
          {...register("venue")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.venue && (
          <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-description"
          className="block text-sm font-medium text-gray-700"
        >
          Descripcion
        </label>
        <textarea
          id="edit-description"
          rows={4}
          {...register("description")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="edit-imageUrl"
          className="block text-sm font-medium text-gray-700"
        >
          URL de imagen
        </label>
        <input
          id="edit-imageUrl"
          type="url"
          {...register("imageUrl")}
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.imageUrl.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
