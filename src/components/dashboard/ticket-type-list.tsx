"use client";

import { useState } from "react";
import type { TicketType } from "@/lib/db/schema/ticket-types";
import type { Batch } from "@/lib/db/schema/batches";
import { formatMoney } from "@/lib/utils/money";
import { TicketTypeDialog } from "./ticket-type-dialog";
import { BatchList } from "./batch-list";
import { updateTicketTypeAction } from "@/lib/actions/ticket-types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TicketTypeListProps = {
  eventId: string;
  ticketTypes: TicketType[];
  batchesByType: Record<string, Batch[]>;
  currency: string;
  feePercentage: number;
  feeFixed: number;
};

export function TicketTypeList({
  eventId,
  ticketTypes,
  batchesByType,
  currency,
  feePercentage,
  feeFixed,
}: TicketTypeListProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<TicketType | null>(null);

  function handleEdit(tt: TicketType) {
    setEditingType(tt);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingType(null);
    setDialogOpen(true);
  }

  async function handleToggleActive(tt: TicketType) {
    const result = await updateTicketTypeAction(tt.id, {
      isActive: !tt.isActive,
    });
    if (result.success) {
      toast.success(
        tt.isActive ? "Tipo de entrada desactivado" : "Tipo de entrada activado",
      );
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tipos de entrada</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Agregar tipo de entrada
        </button>
      </div>

      {ticketTypes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-400">
            No hay tipos de entrada configurados.
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Crear primer tipo de entrada
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketTypes.map((tt) => (
            <div
              key={tt.id}
              className={`rounded-lg border p-4 ${tt.isActive ? "border-gray-200" : "border-gray-200 bg-gray-50 opacity-60"}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{tt.name}</h3>
                    {!tt.isActive && (
                      <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {tt.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {tt.description}
                    </p>
                  )}
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>Precio: {formatMoney(tt.price, currency)}</span>
                    <span>
                      Capacidad: {tt.soldCount}/{tt.maxCapacity}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(tt)}
                    className="rounded px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(tt)}
                    className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    {tt.isActive ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>

              <BatchList
                ticketTypeId={tt.id}
                eventId={eventId}
                maxCapacity={tt.maxCapacity}
                batches={batchesByType[tt.id] ?? []}
              />
            </div>
          ))}
        </div>
      )}

      <TicketTypeDialog
        eventId={eventId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingType={editingType}
        currency={currency}
        feePercentage={feePercentage}
        feeFixed={feeFixed}
      />
    </div>
  );
}
