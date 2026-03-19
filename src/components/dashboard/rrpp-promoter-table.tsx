"use client";

import { useState } from "react";
import type { RRPPPromoter } from "@/lib/db/schema/rrpp";
import { PromoterDialog } from "@/components/dashboard/rrpp-promoter-dialog";
import { formatMoney } from "@/lib/utils/money";

type PromoterWithPerformance = RRPPPromoter & {
  ticketsSold: number;
  revenue: number;
};

type RRPPPromoterTableProps = {
  promoters: PromoterWithPerformance[];
  currency: string;
};

export function RRPPPromoterTable({
  promoters,
  currency,
}: RRPPPromoterTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromoter, setEditingPromoter] = useState<RRPPPromoter | undefined>();
  const [search, setSearch] = useState("");

  const filtered = promoters.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar promotor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => {
            setEditingPromoter(undefined);
            setDialogOpen(true);
          }}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nuevo promotor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 pr-4 font-medium">Nombre</th>
              <th className="pb-2 pr-4 font-medium">Telefono</th>
              <th className="pb-2 pr-4 font-medium">Email</th>
              <th className="pb-2 pr-4 font-medium text-right">Ventas</th>
              <th className="pb-2 pr-4 font-medium text-right">Ingresos</th>
              <th className="pb-2 font-medium">Estado</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2 pr-4 font-medium">{p.name}</td>
                <td className="py-2 pr-4 text-gray-500">{p.phone ?? "—"}</td>
                <td className="py-2 pr-4 text-gray-500">{p.email ?? "—"}</td>
                <td className="py-2 pr-4 text-right">{p.ticketsSold}</td>
                <td className="py-2 pr-4 text-right">{formatMoney(p.revenue, currency)}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPromoter(p);
                      setDialogOpen(true);
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No se encontraron promotores
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PromoterDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPromoter(undefined);
        }}
        editingPromoter={editingPromoter}
      />
    </div>
  );
}
