"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { TicketType } from "@/lib/db/schema/ticket-types";
import { TicketQuantitySelector } from "@/components/shared/ticket-quantity-selector";
import { formatMoney, calculateServiceFee } from "@/lib/utils/money";

type TicketSelectorSectionProps = {
  eventSlug: string;
  producerSlug: string;
  ticketTypes: TicketType[];
  currency: string;
  feePercentage: number;
  feeFixed: number;
  rrppRef?: string;
};

export function TicketSelectorSection({
  eventSlug,
  producerSlug,
  ticketTypes,
  currency,
  feePercentage,
  feeFixed,
  rrppRef,
}: TicketSelectorSectionProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalFee = 0;
    let count = 0;

    for (const tt of ticketTypes) {
      const qty = quantities[tt.id] ?? 0;
      if (qty > 0) {
        const fee = calculateServiceFee(tt.price, feePercentage, feeFixed);
        subtotal += tt.price * qty;
        totalFee += fee * qty;
        count += qty;
      }
    }

    return { subtotal, totalFee, total: subtotal + totalFee, count };
  }, [quantities, ticketTypes, feePercentage, feeFixed]);

  function handleProceed() {
    const items = ticketTypes
      .filter((tt) => (quantities[tt.id] ?? 0) > 0)
      .map((tt) => `${tt.id}:${quantities[tt.id]}`)
      .join(",");

    const params = new URLSearchParams({ items });
    if (rrppRef) params.set("ref", rrppRef);

    router.push(
      `/${producerSlug}/events/${eventSlug}/checkout?${params.toString()}`,
    );
  }

  return (
    <>
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Entradas</h2>
        <div className="space-y-3">
          {ticketTypes.map((tt) => {
            const available = tt.maxCapacity - tt.soldCount;
            const fee = calculateServiceFee(tt.price, feePercentage, feeFixed);

            return (
              <div
                key={tt.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{tt.name}</p>
                  {tt.description && (
                    <p className="text-sm text-gray-500">{tt.description}</p>
                  )}
                  <p className="mt-1 text-sm">
                    {formatMoney(tt.price, currency)}
                    {fee > 0 && (
                      <span className="text-gray-400">
                        {" "}
                        + {formatMoney(fee, currency)} fee
                      </span>
                    )}
                  </p>
                  {available <= 10 && available > 0 && (
                    <p className="mt-1 text-xs font-medium text-amber-600">
                      Quedan {available}
                    </p>
                  )}
                  {available <= 0 && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      Agotado
                    </p>
                  )}
                </div>
                <TicketQuantitySelector
                  value={quantities[tt.id] ?? 0}
                  onChange={(v) =>
                    setQuantities((prev) => ({ ...prev, [tt.id]: v }))
                  }
                  max={Math.min(available, 10)}
                  disabled={available <= 0}
                />
              </div>
            );
          })}
        </div>
      </div>

      {totals.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-4 shadow-lg">
          <div className="mx-auto max-w-[480px]">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">
                {totals.count} entrada{totals.count !== 1 ? "s" : ""}
              </span>
              <div className="text-right">
                <span className="text-gray-500">
                  Subtotal {formatMoney(totals.subtotal, currency)}
                </span>
                {totals.totalFee > 0 && (
                  <span className="ml-2 text-gray-400">
                    + {formatMoney(totals.totalFee, currency)} fee
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleProceed}
              className="w-full rounded-lg bg-[var(--producer-primary,#6366f1)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Continuar &middot; {formatMoney(totals.total, currency)}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
