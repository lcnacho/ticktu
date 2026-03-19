"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { TicketType } from "@/lib/db/schema/ticket-types";
import { formatMoney, calculateServiceFee } from "@/lib/utils/money";
import { createCheckoutAction } from "@/lib/actions/checkout";

const holderSchema = z.object({
  ticketTypeId: z.string(),
  holderName: z.string().min(1, "El nombre es obligatorio"),
  holderEmail: z.string().min(1, "El email es obligatorio").email("Email invalido"),
});

const checkoutSchema = z.object({
  buyerName: z.string().min(1, "El nombre es obligatorio"),
  buyerEmail: z.string().min(1, "El email es obligatorio").email("Email invalido"),
  holders: z.array(holderSchema).min(1),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type CheckoutFormProps = {
  producerSlug: string;
  eventId: string;
  ticketTypes: TicketType[];
  items: { ticketTypeId: string; quantity: number }[];
  currency: string;
  feePercentage: number;
  feeFixed: number;
  rrppRef?: string;
};

export function CheckoutForm({
  producerSlug,
  eventId,
  ticketTypes,
  items,
  currency,
  feePercentage,
  feeFixed,
  rrppRef,
}: CheckoutFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const holders = useMemo(() => {
    const result: { ticketTypeId: string; holderName: string; holderEmail: string }[] = [];
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        result.push({ ticketTypeId: item.ticketTypeId, holderName: "", holderEmail: "" });
      }
    }
    return result;
  }, [items]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
    control,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      buyerName: "",
      buyerEmail: "",
      holders,
    },
  });

  const { fields } = useFieldArray({ control, name: "holders" });

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalFee = 0;
    let count = 0;

    for (const item of items) {
      const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (!tt) continue;
      const fee = calculateServiceFee(tt.price, feePercentage, feeFixed);
      subtotal += tt.price * item.quantity;
      totalFee += fee * item.quantity;
      count += item.quantity;
    }

    return { subtotal, totalFee, total: subtotal + totalFee, count };
  }, [items, ticketTypes, feePercentage, feeFixed]);

  async function handleNext() {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const valid = await trigger(["buyerName", "buyerEmail", "holders"]);
      if (valid) setStep(3);
    }
  }

  async function onSubmit(data: CheckoutFormData) {
    setIsSubmitting(true);

    const result = await createCheckoutAction({
      producerSlug,
      eventId,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail,
      items: data.holders,
      rrppRef,
    });

    if (result.success) {
      window.location.href = result.data.redirectUrl;
    } else {
      toast.error(result.error.message);
      setIsSubmitting(false);
    }
  }

  const watchedValues = watch();

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[
          { num: 1, label: "Tickets" },
          { num: 2, label: "Datos" },
          { num: 3, label: "Pago" },
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                step >= num
                  ? "bg-[var(--producer-primary,#6366f1)] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {num}
            </div>
            <span className={`text-sm ${step >= num ? "font-medium" : "text-gray-400"}`}>
              {label}
            </span>
            {num < 3 && <div className="mx-1 h-px w-6 bg-gray-300" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 — Ticket Summary */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Resumen de entradas</h2>
            {items.map((item) => {
              const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
              if (!tt) return null;
              const fee = calculateServiceFee(tt.price, feePercentage, feeFixed);
              return (
                <div key={item.ticketTypeId} className="flex justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{tt.name}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatMoney((tt.price + fee) * item.quantity, currency)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2 — Buyer + Holder details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-lg font-semibold">Datos del comprador</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700">
                    Nombre completo *
                  </label>
                  <input
                    id="buyerName"
                    type="text"
                    {...register("buyerName")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.buyerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.buyerName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    id="buyerEmail"
                    type="email"
                    {...register("buyerEmail")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {errors.buyerEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.buyerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold">Datos por entrada</h2>
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const tt = ticketTypes.find((t) => t.id === field.ticketTypeId);
                  return (
                    <div key={field.id} className="rounded-lg border p-3">
                      <p className="mb-2 text-sm font-medium text-gray-500">
                        Entrada {index + 1} — {tt?.name ?? ""}
                      </p>
                      <div className="space-y-2">
                        <div>
                          <label
                            htmlFor={`holders.${index}.holderName`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Nombre *
                          </label>
                          <input
                            id={`holders.${index}.holderName`}
                            type="text"
                            {...register(`holders.${index}.holderName`)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          {errors.holders?.[index]?.holderName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.holders[index].holderName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`holders.${index}.holderEmail`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email *
                          </label>
                          <input
                            id={`holders.${index}.holderEmail`}
                            type="email"
                            {...register(`holders.${index}.holderEmail`)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          {errors.holders?.[index]?.holderEmail && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.holders[index].holderEmail.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Summary + Pay */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Confirmar compra</h2>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Comprador</p>
              <p className="font-medium">{watchedValues.buyerName}</p>
              <p className="text-sm text-gray-500">{watchedValues.buyerEmail}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="mb-2 text-sm text-gray-500">Entradas</p>
              {items.map((item) => {
                const tt = ticketTypes.find((t) => t.id === item.ticketTypeId);
                if (!tt) return null;
                const fee = calculateServiceFee(tt.price, feePercentage, feeFixed);
                return (
                  <div key={item.ticketTypeId} className="flex justify-between py-1 text-sm">
                    <span>
                      {tt.name} x{item.quantity}
                    </span>
                    <span>{formatMoney(tt.price * item.quantity, currency)}</span>
                  </div>
                );
              })}
              {totals.totalFee > 0 && (
                <div className="flex justify-between border-t pt-1 text-sm text-gray-500">
                  <span>Fee de servicio</span>
                  <span>{formatMoney(totals.totalFee, currency)}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{formatMoney(totals.total, currency)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom action bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-4 shadow-lg">
          <div className="mx-auto max-w-[480px]">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full rounded-lg bg-[var(--producer-primary,#6366f1)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                {step === 1 ? "Continuar" : "Revisar y pagar"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[var(--producer-primary,#6366f1)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? "Procesando..." : `Pagar ${formatMoney(totals.total, currency)}`}
              </button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                &larr; Volver
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
