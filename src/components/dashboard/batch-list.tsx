"use client";

import { useState } from "react";
import type { Batch } from "@/lib/db/schema/batches";
import { BatchDialog } from "./batch-dialog";
import { formatDateTime } from "@/lib/utils/dates";

type BatchListProps = {
  ticketTypeId: string;
  eventId: string;
  maxCapacity: number;
  batches: Batch[];
};

function getBatchStatus(batch: Batch): {
  label: string;
  className: string;
} {
  if (batch.soldCount >= batch.quantity) {
    return {
      label: "Agotado",
      className: "bg-red-100 text-red-700",
    };
  }
  if (new Date(batch.activatesAt) > new Date()) {
    return {
      label: "Programado",
      className: "bg-yellow-100 text-yellow-700",
    };
  }
  return {
    label: "Activo",
    className: "bg-green-100 text-green-700",
  };
}

export function BatchList({
  ticketTypeId,
  eventId,
  maxCapacity,
  batches,
}: BatchListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-600">Lotes</h4>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50"
        >
          Agregar lote
        </button>
      </div>

      {batches.length === 0 ? (
        <p className="mt-2 text-xs text-gray-400">
          No hay lotes configurados.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {batches.map((batch) => {
            const status = getBatchStatus(batch);
            return (
              <div
                key={batch.id}
                className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{batch.name}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>
                    {batch.soldCount}/{batch.quantity}
                  </span>
                  <span>{formatDateTime(new Date(batch.activatesAt))}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BatchDialog
        ticketTypeId={ticketTypeId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
