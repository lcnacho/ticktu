"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const authSchema = z.object({
  code: z.string().min(1, "El codigo es obligatorio"),
  operatorName: z.string().min(1, "El nombre del operador es obligatorio"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function ValidationEntryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { code: "", operatorName: "" },
  });

  async function onSubmit(data: AuthFormData) {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/validation/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: data.code.toUpperCase(),
          operatorName: data.operatorName,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Codigo invalido");
        setIsSubmitting(false);
        return;
      }

      const { eventId, tenantId, sessionToken } = await res.json();

      // Store in sessionStorage for the scanner
      sessionStorage.setItem(
        "validation_session",
        JSON.stringify({
          eventId,
          tenantId,
          operatorName: data.operatorName,
          deviceId: crypto.randomUUID(),
          sessionToken,
        }),
      );

      router.push("/validacion/scan");
    } catch {
      toast.error("Error de conexion");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Validacion de Entradas</h1>
          <p className="mt-2 text-sm text-gray-500">
            Ingresa el codigo del evento y tu nombre
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Codigo del evento *
            </label>
            <input
              id="code"
              type="text"
              {...register("code")}
              placeholder="ABC123"
              autoComplete="off"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-center text-lg font-mono uppercase tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700">
              Nombre del operador *
            </label>
            <input
              id="operatorName"
              type="text"
              {...register("operatorName")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {errors.operatorName && (
              <p className="mt-1 text-sm text-red-600">{errors.operatorName.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
