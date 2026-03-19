"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Event } from "@/lib/db/schema/events";
import type { TicketType } from "@/lib/db/schema/ticket-types";
import { TicketQuantitySelector } from "@/components/shared/ticket-quantity-selector";
import { formatMoney } from "@/lib/utils/money";
import { createBoleteriaOrderAction } from "@/lib/actions/boleteria";

const boleteriaSchema = z.object({
  buyerName: z.string().min(1, "El nombre es obligatorio"),
  buyerEmail: z.string().email("Email invalido").optional().or(z.literal("")),
  paymentMethod: z.enum(["cash", "transfer"]),
});

type BoleteriaFormData = z.infer<typeof boleteriaSchema>;

type BoleteriaFormProps = {
  events: Event[];
  ticketTypesByEvent: Record<string, TicketType[]>;
  currency: string;
};

export function BoleteriaForm({
  events,
  ticketTypesByEvent,
  currency,
}: BoleteriaFormProps) {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTicketTypes = ticketTypesByEvent[selectedEventId] ?? [];

  const selectedTT = currentTicketTypes.find((tt) => tt.id === selectedTicketTypeId);
  const total = selectedTT ? selectedTT.price * quantity : 0;
  const available = selectedTT ? selectedTT.maxCapacity - selectedTT.soldCount : 0;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoleteriaFormData>({
    resolver: zodResolver(boleteriaSchema),
    defaultValues: { buyerName: "", buyerEmail: "", paymentMethod: "cash" },
  });

  async function onSubmit(data: BoleteriaFormData) {
    if (!selectedEventId || !selectedTicketTypeId || quantity < 1) {
      toast.error("Selecciona un evento, tipo de entrada y cantidad");
      return;
    }

    setIsSubmitting(true);

    const result = await createBoleteriaOrderAction({
      eventId: selectedEventId,
      ticketTypeId: selectedTicketTypeId,
      quantity,
      buyerName: data.buyerName,
      buyerEmail: data.buyerEmail || undefined,
      paymentMethod: data.paymentMethod,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Venta registrada — ${quantity} entrada${quantity > 1 ? "s" : ""}`);
      reset();
      setQuantity(1);
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Event selector */}
      <div>
        <label htmlFor="pos-event" className="block text-sm font-medium text-gray-700">
          Evento
        </label>
        <select
          id="pos-event"
          value={selectedEventId}
          onChange={(e) => {
            setSelectedEventId(e.target.value);
            setSelectedTicketTypeId("");
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ticket type radio */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Tipo de entrada</p>
        <div className="space-y-2">
          {currentTicketTypes.map((tt) => (
            <label
              key={tt.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
                selectedTicketTypeId === tt.id ? "border-indigo-500 bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ticketType"
                  value={tt.id}
                  checked={selectedTicketTypeId === tt.id}
                  onChange={() => setSelectedTicketTypeId(tt.id)}
                  className="accent-indigo-600"
                />
                <span className="text-sm font-medium">{tt.name}</span>
              </div>
              <span className="text-sm">{formatMoney(tt.price, currency)}</span>
            </label>
          ))}
          {currentTicketTypes.length === 0 && (
            <p className="text-sm text-gray-400">Sin tipos de entrada configurados</p>
          )}
        </div>
      </div>

      {/* Quantity */}
      {selectedTicketTypeId && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Cantidad</span>
          <TicketQuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={Math.min(available, 20)}
          />
        </div>
      )}

      {/* Buyer data */}
      <div className="space-y-3">
        <div>
          <label htmlFor="pos-name" className="block text-sm font-medium text-gray-700">
            Nombre del comprador *
          </label>
          <input
            id="pos-name"
            type="text"
            {...register("buyerName")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.buyerName && (
            <p className="mt-1 text-sm text-red-600">{errors.buyerName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="pos-email" className="block text-sm font-medium text-gray-700">
            Email (opcional)
          </label>
          <input
            id="pos-email"
            type="email"
            {...register("buyerEmail")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {errors.buyerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.buyerEmail.message}</p>
          )}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Metodo de pago</p>
        <div className="flex gap-3">
          {(["cash", "transfer"] as const).map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 rounded-lg border px-4 py-2"
            >
              <input
                type="radio"
                value={method}
                {...register("paymentMethod")}
                className="accent-indigo-600"
              />
              <span className="text-sm capitalize">
                {method === "cash" ? "Efectivo" : "Transferencia"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Total + Submit */}
      {total > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-lg font-bold">{formatMoney(total, currency)}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedTicketTypeId}
        className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? "Registrando..." : "Confirmar venta"}
      </button>
    </form>
  );
}
