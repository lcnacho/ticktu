"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { EventStatus } from "@/lib/db/schema/events";
import { getValidTransitions } from "@/lib/utils/event-transitions";
import {
  publishEventAction,
  finishEventAction,
  archiveEventAction,
} from "@/lib/actions/events";

const TRANSITION_CONFIG: Record<
  string,
  {
    label: string;
    confirmTitle: string;
    confirmMessage: string;
    action: (eventId: string) => Promise<{ success: boolean; error?: { message: string } }>;
    variant: string;
  }
> = {
  published: {
    label: "Publicar",
    confirmTitle: "Publicar evento",
    confirmMessage:
      "El evento sera visible para los compradores. Quieres continuar?",
    action: publishEventAction,
    variant: "bg-green-600 hover:bg-green-700",
  },
  finished: {
    label: "Finalizar",
    confirmTitle: "Finalizar evento",
    confirmMessage:
      "El evento se marcara como finalizado y no se podran vender mas entradas. Quieres continuar?",
    action: finishEventAction,
    variant: "bg-blue-600 hover:bg-blue-700",
  },
  archived: {
    label: "Archivar",
    confirmTitle: "Archivar evento",
    confirmMessage:
      "El evento se archivara y dejara de ser visible. Quieres continuar?",
    action: archiveEventAction,
    variant: "bg-yellow-600 hover:bg-yellow-700",
  },
};

type EventActionsProps = {
  eventId: string;
  currentStatus: EventStatus;
};

export function EventActions({ eventId, currentStatus }: EventActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingTransition, setConfirmingTransition] = useState<string | null>(null);

  const validTransitions = getValidTransitions(currentStatus);

  if (validTransitions.length === 0) return null;

  async function handleTransition(targetStatus: string) {
    const config = TRANSITION_CONFIG[targetStatus];
    if (!config) return;

    setIsLoading(true);
    const result = await config.action(eventId);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Evento ${config.label.toLowerCase()}do exitosamente`);
      router.refresh();
    } else {
      toast.error(result.error?.message ?? "Error al cambiar el estado");
    }
    setConfirmingTransition(null);
  }

  return (
    <div className="flex gap-2">
      {validTransitions.map((targetStatus) => {
        const config = TRANSITION_CONFIG[targetStatus];
        if (!config) return null;

        if (confirmingTransition === targetStatus) {
          return (
            <div
              key={targetStatus}
              className="flex items-center gap-2 rounded-md border bg-white p-3 shadow-sm"
            >
              <div className="mr-2">
                <p className="text-sm font-medium">{config.confirmTitle}</p>
                <p className="text-xs text-gray-500">{config.confirmMessage}</p>
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleTransition(targetStatus)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${config.variant} disabled:opacity-50`}
              >
                {isLoading ? "..." : "Confirmar"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setConfirmingTransition(null)}
                className="rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          );
        }

        return (
          <button
            key={targetStatus}
            type="button"
            onClick={() => setConfirmingTransition(targetStatus)}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${config.variant}`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
