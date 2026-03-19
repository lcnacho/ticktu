"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createEventAction } from "@/lib/actions/events";
import { slugify } from "@/lib/utils/slugify";

const createEventSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  slug: z.string().min(1, "El slug es obligatorio").max(200),
  date: z.string().min(1, "La fecha es obligatoria"),
  venue: z.string().min(1, "El lugar es obligatorio").max(200),
  description: z.string().max(2000).optional(),
  imageUrl: z.url("URL invalida").optional().or(z.literal("")),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      slug: "",
      date: "",
      venue: "",
      description: "",
      imageUrl: "",
    },
  });

  const nameValue = watch("name");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue("name", name);
    setValue("slug", slugify(name));
  }

  async function onSubmit(data: CreateEventFormData) {
    setIsSubmitting(true);

    const result = await createEventAction({
      name: data.name,
      slug: data.slug,
      date: data.date,
      venue: data.venue,
      description: data.description || undefined,
      imageUrl: data.imageUrl || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Evento creado exitosamente");
      router.push(`/events/${result.data.id}`);
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <a
          href="/events"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Volver a eventos
        </a>
        <h1 className="mt-2 text-2xl font-bold">Crear evento</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre del evento *
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            onChange={handleNameChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700"
          >
            URL del evento *
          </label>
          <input
            id="slug"
            type="text"
            {...register("slug")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Se usara en la URL publica del evento
          </p>
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Fecha y hora *
          </label>
          <input
            id="date"
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
            htmlFor="venue"
            className="block text-sm font-medium text-gray-700"
          >
            Lugar *
          </label>
          <input
            id="venue"
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
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descripcion
          </label>
          <textarea
            id="description"
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
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700"
          >
            URL de imagen
          </label>
          <input
            id="imageUrl"
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

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear evento"}
          </button>
          <a
            href="/events"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
