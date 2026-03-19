"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Ticket } from "@/lib/db/schema/tickets";
import type { TicketType } from "@/lib/db/schema/ticket-types";
import { EmptyState } from "@/components/shared/empty-state";
import { issueComplimentaryTicketAction } from "@/lib/actions/tickets";
import { formatDateTime } from "@/lib/utils/dates";

const cortesiaSchema = z.object({
  ticketTypeId: z.string().min(1, "Selecciona un tipo de entrada"),
  holderName: z.string().min(1, "El nombre es obligatorio").max(200),
  holderEmail: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Email invalido"),
});

type CortesiaFormData = z.infer<typeof cortesiaSchema>;

type CortesiasTabProps = {
  eventId: string;
  tickets: Ticket[];
  ticketTypes: TicketType[];
  countByType: { ticketTypeId: string; count: number }[];
};

export function CortesiasTab({
  eventId,
  tickets,
  ticketTypes,
  countByType,
}: CortesiasTabProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTypes = ticketTypes.filter((tt) => tt.isActive);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CortesiaFormData>({
    resolver: zodResolver(cortesiaSchema),
    defaultValues: { ticketTypeId: "", holderName: "", holderEmail: "" },
  });

  async function onSubmit(data: CortesiaFormData) {
    setIsSubmitting(true);

    const result = await issueComplimentaryTicketAction({
      eventId,
      ticketTypeId: data.ticketTypeId,
      holderName: data.holderName,
      holderEmail: data.holderEmail,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Cortesia enviada a ${data.holderName}`);
      reset();
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  const totalCount = countByType.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cortesias</h2>
          {totalCount > 0 && (
            <p className="text-sm text-gray-500">
              {totalCount} cortesia{totalCount !== 1 ? "s" : ""} emitida
              {totalCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Enviar cortesia
        </button>
      </div>

      {countByType.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {countByType.map((c) => {
            const tt = ticketTypes.find((t) => t.id === c.ticketTypeId);
            return (
              <div
                key={c.ticketTypeId}
                className="rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="font-medium">{tt?.name ?? "—"}</span>:{" "}
                {c.count}
              </div>
            );
          })}
        </div>
      )}

      {tickets.length === 0 ? (
        <EmptyState
          variant="first-use"
          title="Sin cortesias"
          description="Emiti tu primera cortesia para invitados y VIPs."
          action={{
            label: "Enviar primera cortesia",
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Nombre</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Tipo</th>
                <th className="pb-2 pr-4 font-medium">Fecha</th>
                <th className="pb-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const tt = ticketTypes.find(
                  (t) => t.id === ticket.ticketTypeId,
                );
                return (
                  <tr key={ticket.id} className="border-b">
                    <td className="py-2 pr-4">{ticket.holderName}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {ticket.holderEmail}
                    </td>
                    <td className="py-2 pr-4">{tt?.name ?? "—"}</td>
                    <td className="py-2 pr-4 text-gray-500">
                      {formatDateTime(new Date(ticket.createdAt))}
                    </td>
                    <td className="py-2">
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Enviar cortesia</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="cortesia-type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de entrada *
                </label>
                <select
                  id="cortesia-type"
                  {...register("ticketTypeId")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Seleccionar...</option>
                  {activeTypes.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      {tt.name}
                    </option>
                  ))}
                </select>
                {errors.ticketTypeId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ticketTypeId.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cortesia-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre *
                </label>
                <input
                  id="cortesia-name"
                  type="text"
                  {...register("holderName")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.holderName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.holderName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cortesia-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="cortesia-email"
                  type="email"
                  {...register("holderEmail")}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.holderEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.holderEmail.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setDialogOpen(false);
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
                  {isSubmitting ? "Enviando..." : "Enviar cortesia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
