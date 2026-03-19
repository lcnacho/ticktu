"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTenantAction } from "@/lib/actions/admin";

const tenantSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  slug: z
    .string()
    .min(1, "El slug es obligatorio")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Solo letras minusculas, numeros y guiones"),
  adminEmail: z.string().email("Email invalido"),
  adminPassword: z.string().min(8, "Minimo 8 caracteres"),
  logoUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  primaryColor: z.string().min(1),
  accentColor: z.string().min(1),
  heroImageUrl: z.string().url("URL invalida").optional().or(z.literal("")),
  heroTagline: z.string().max(200).optional().or(z.literal("")),
  aboutText: z.string().max(2000).optional().or(z.literal("")),
  socialLinks: z.string().optional().or(z.literal("")),
  heroVisible: z.boolean(),
  socialVisible: z.boolean(),
  aboutVisible: z.boolean(),
  currency: z.string().min(1),
  feePercentage: z.number().min(0).max(100),
  feeFixed: z.number().min(0),
});

type TenantFormData = z.infer<typeof tenantSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewTenantPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      adminEmail: "",
      adminPassword: "",
      logoUrl: "",
      primaryColor: "#6366f1",
      accentColor: "#f59e0b",
      heroImageUrl: "",
      heroTagline: "",
      aboutText: "",
      socialLinks: "",
      heroVisible: true,
      socialVisible: true,
      aboutVisible: true,
      currency: "UYU",
      feePercentage: 5,
      feeFixed: 0,
    },
  });

  const primaryColor = watch("primaryColor");
  const accentColor = watch("accentColor");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setValue("name", name);
    setValue("slug", slugify(name));
  }

  async function onSubmit(data: TenantFormData) {
    setIsSubmitting(true);

    let socialLinks: Record<string, string> = {};
    if (data.socialLinks?.trim()) {
      try {
        socialLinks = JSON.parse(data.socialLinks);
      } catch {
        toast.error("Social links debe ser JSON valido");
        setIsSubmitting(false);
        return;
      }
    }

    const result = await createTenantAction({
      name: data.name,
      slug: data.slug,
      adminEmail: data.adminEmail,
      adminPassword: data.adminPassword,
      logoUrl: data.logoUrl || undefined,
      primaryColor: data.primaryColor,
      accentColor: data.accentColor,
      heroImageUrl: data.heroImageUrl || undefined,
      heroTagline: data.heroTagline || undefined,
      aboutText: data.aboutText || undefined,
      socialLinks,
      config: {
        heroVisible: data.heroVisible,
        socialVisible: data.socialVisible,
        aboutVisible: data.aboutVisible,
      },
      currency: data.currency,
      feePercentage: data.feePercentage,
      feeFixed: data.feeFixed,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Productora creada exitosamente");
      router.push("/tenants");
    } else {
      toast.error(result.error.message);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-gray-700";
  const errorClass = "mt-1 text-sm text-red-600";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nueva Productora</h1>
        <p className="text-sm text-gray-500">
          Crear una nueva productora y su usuario administrador
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Informacion basica
          </legend>

          <div>
            <label htmlFor="name" className={labelClass}>
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              onChange={handleNameChange}
              placeholder="Mi Productora"
              className={inputClass}
            />
            {errors.name && (
              <p className={errorClass}>{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug *
            </label>
            <input
              id="slug"
              type="text"
              {...register("slug")}
              placeholder="mi-productora"
              className={inputClass}
            />
            {errors.slug && (
              <p className={errorClass}>{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className={labelClass}>
              Moneda *
            </label>
            <select id="currency" {...register("currency")} className={inputClass}>
              <option value="UYU">UYU</option>
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </fieldset>

        {/* Admin credentials */}
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Credenciales del administrador
          </legend>

          <div>
            <label htmlFor="adminEmail" className={labelClass}>
              Email *
            </label>
            <input
              id="adminEmail"
              type="email"
              {...register("adminEmail")}
              placeholder="admin@productora.com"
              className={inputClass}
            />
            {errors.adminEmail && (
              <p className={errorClass}>{errors.adminEmail.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="adminPassword" className={labelClass}>
              Password *
            </label>
            <input
              id="adminPassword"
              type="password"
              {...register("adminPassword")}
              placeholder="Minimo 8 caracteres"
              className={inputClass}
            />
            {errors.adminPassword && (
              <p className={errorClass}>{errors.adminPassword.message}</p>
            )}
          </div>
        </fieldset>

        {/* Branding */}
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Branding
          </legend>

          <div>
            <label htmlFor="logoUrl" className={labelClass}>
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="text"
              {...register("logoUrl")}
              placeholder="https://..."
              className={inputClass}
            />
            {errors.logoUrl && (
              <p className={errorClass}>{errors.logoUrl.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="primaryColor" className={labelClass}>
                Color primario *
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="primaryColor"
                  type="color"
                  {...register("primaryColor")}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                />
                <span className="text-sm text-gray-500">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label htmlFor="accentColor" className={labelClass}>
                Color acento *
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="accentColor"
                  type="color"
                  {...register("accentColor")}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                />
                <span className="text-sm text-gray-500">{accentColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="heroImageUrl" className={labelClass}>
              Hero image URL
            </label>
            <input
              id="heroImageUrl"
              type="text"
              {...register("heroImageUrl")}
              placeholder="https://..."
              className={inputClass}
            />
            {errors.heroImageUrl && (
              <p className={errorClass}>{errors.heroImageUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="heroTagline" className={labelClass}>
              Hero tagline
            </label>
            <input
              id="heroTagline"
              type="text"
              {...register("heroTagline")}
              placeholder="Tu slogan aqui"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="aboutText" className={labelClass}>
              Acerca de
            </label>
            <textarea
              id="aboutText"
              rows={3}
              {...register("aboutText")}
              placeholder="Descripcion de la productora..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="socialLinks" className={labelClass}>
              Social links (JSON)
            </label>
            <input
              id="socialLinks"
              type="text"
              {...register("socialLinks")}
              placeholder='{"instagram": "https://...", "twitter": "https://..."}'
              className={inputClass}
            />
          </div>
        </fieldset>

        {/* Config toggles */}
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Visibilidad de secciones
          </legend>

          <div className="flex items-center gap-3">
            <input
              id="heroVisible"
              type="checkbox"
              {...register("heroVisible")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="heroVisible" className="text-sm text-gray-700">
              Hero visible
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="socialVisible"
              type="checkbox"
              {...register("socialVisible")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="socialVisible" className="text-sm text-gray-700">
              Social links visible
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="aboutVisible"
              type="checkbox"
              {...register("aboutVisible")}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="aboutVisible" className="text-sm text-gray-700">
              About visible
            </label>
          </div>
        </fieldset>

        {/* Fees */}
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-2 text-sm font-semibold text-gray-700">
            Comisiones
          </legend>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="feePercentage" className={labelClass}>
                Fee porcentaje (%) *
              </label>
              <input
                id="feePercentage"
                type="number"
                min={0}
                max={100}
                {...register("feePercentage", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.feePercentage && (
                <p className={errorClass}>{errors.feePercentage.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="feeFixed" className={labelClass}>
                Fee fijo (centavos) *
              </label>
              <input
                id="feeFixed"
                type="number"
                min={0}
                {...register("feeFixed", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.feeFixed && (
                <p className={errorClass}>{errors.feeFixed.message}</p>
              )}
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/tenants")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear productora"}
          </button>
        </div>
      </form>
    </div>
  );
}
