"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RRPPPromoter } from "@/lib/db/schema/rrpp";
import { generateRRPPLinkAction } from "@/lib/actions/rrpp";
import { formatMoney } from "@/lib/utils/money";
import { Copy, Link } from "lucide-react";
import { Button } from "@/components/ui/button";

type PerformanceRow = {
  promoterId: string;
  promoterName: string;
  ticketsSold: number;
  revenue: number;
  linkCode: string;
};

type EventRRPPTabProps = {
  eventId: string;
  promoters: RRPPPromoter[];
  performance: PerformanceRow[];
  currency: string;
  baseUrl: string;
};

export function EventRRPPTab({
  eventId,
  promoters,
  performance,
  currency,
  baseUrl,
}: EventRRPPTabProps) {
  const router = useRouter();
  const [generating, setGenerating] = useState<string | null>(null);

  async function handleGenerate(promoterId: string) {
    setGenerating(promoterId);
    const result = await generateRRPPLinkAction({ eventId, promoterId });
    setGenerating(null);

    if (result.success) {
      toast.success("Link generado");
      router.refresh();
    } else {
      toast.error(result.error.message);
    }
  }

  function copyLink(code: string) {
    const url = `${baseUrl}?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado");
  }

  // Promoters without a link for this event
  const linkedPromoterIds = new Set(performance.map((p) => p.promoterId));
  const unlinkedPromoters = promoters.filter((p) => !linkedPromoterIds.has(p.id));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Links de RRPP</h2>

      {performance.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Promotor</th>
                <th className="pb-2 pr-4 font-medium text-right">Ventas</th>
                <th className="pb-2 pr-4 font-medium text-right">Ingresos</th>
                <th className="pb-2 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((row) => (
                <tr key={row.promoterId} className="border-b">
                  <td className="py-2 pr-4 font-medium">{row.promoterName}</td>
                  <td className="py-2 pr-4 text-right">{row.ticketsSold}</td>
                  <td className="py-2 pr-4 text-right">{formatMoney(row.revenue, currency)}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => copyLink(row.linkCode)}
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <Copy className="size-3.5" />
                      Copiar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {unlinkedPromoters.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">
            Promotores sin link para este evento
          </h3>
          <div className="space-y-2">
            {unlinkedPromoters.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm font-medium">{p.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate(p.id)}
                  disabled={generating === p.id}
                >
                  <Link className="size-3.5" />
                  {generating === p.id ? "Generando..." : "Generar link"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {performance.length === 0 && unlinkedPromoters.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-400">
          No hay promotores configurados. Crea promotores desde la seccion RRPP.
        </div>
      )}
    </div>
  );
}
