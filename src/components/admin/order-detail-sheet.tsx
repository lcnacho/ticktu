"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Order } from "@/lib/db/schema/orders";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";
import { reissueTicketAction, processRefundAction } from "@/lib/actions/admin";
import { X } from "lucide-react";

type OrderDetailSheetProps = {
  order: Order;
  tickets: { id: string; holderName: string; holderEmail: string; status: string; ticketType: string }[];
  onClose: () => void;
};

export function OrderDetailSheet({ order, tickets, onClose }: OrderDetailSheetProps) {
  const router = useRouter();
  const [reissueId, setReissueId] = useState<string | null>(null);
  const [reissueReason, setReissueReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleReissue(ticketId: string) {
    if (!reissueReason.trim()) {
      toast.error("La razon es obligatoria");
      return;
    }

    setIsProcessing(true);
    const result = await reissueTicketAction(ticketId, reissueReason);
    setIsProcessing(false);

    if (result.success) {
      toast.success("Ticket re-emitido con nuevo QR");
      setReissueId(null);
      setReissueReason("");
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  async function handleRefund() {
    if (!confirm("Estas seguro de procesar el reembolso?")) return;

    setIsProcessing(true);
    const result = await processRefundAction(order.id, order.tenantId);
    setIsProcessing(false);

    if (result.success) {
      toast.success("Reembolso procesado");
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Detalle de orden</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-gray-400">ID</p>
            <p className="font-mono text-sm">{order.id}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400">Comprador</p>
              <p className="text-sm font-medium">{order.buyerName}</p>
              <p className="text-xs text-gray-500">{order.buyerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Estado</p>
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  order.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : order.status === "refunded"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-sm font-medium">{formatMoney(order.totalAmount, order.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Metodo</p>
              <p className="text-sm capitalize">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Fecha</p>
              <p className="text-sm">{formatDateTime(new Date(order.createdAt))}</p>
            </div>
            {order.mercadopagoPaymentId && (
              <div>
                <p className="text-xs text-gray-400">Payment ID</p>
                <p className="font-mono text-xs">{order.mercadopagoPaymentId}</p>
              </div>
            )}
          </div>

          {/* Refund button */}
          {order.status === "paid" && (
            <button
              type="button"
              onClick={handleRefund}
              disabled={isProcessing}
              className="w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              {isProcessing ? "Procesando..." : "Procesar reembolso"}
            </button>
          )}

          {/* Tickets */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-500">
              Tickets ({tickets.length})
            </h3>
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{ticket.holderName}</p>
                      <p className="text-xs text-gray-500">{ticket.holderEmail}</p>
                      <p className="text-xs text-gray-400">{ticket.ticketType}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                          ticket.status === "valid"
                            ? "bg-green-100 text-green-700"
                            : ticket.status === "used"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  {reissueId === ticket.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={reissueReason}
                        onChange={(e) => setReissueReason(e.target.value)}
                        placeholder="Razon de re-emision..."
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReissue(ticket.id)}
                          disabled={isProcessing}
                          className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReissueId(null);
                            setReissueReason("");
                          }}
                          className="rounded border px-3 py-1 text-xs text-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReissueId(ticket.id)}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Re-emitir ticket
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
