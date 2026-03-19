"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";

type Customer = {
  buyerName: string;
  buyerEmail: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: Date;
};

type CustomerTableProps = {
  customers: Customer[];
  currency: string;
};

export function CustomerTable({ customers, currency }: CustomerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (value) params.set("q", value);
        router.replace(`/customers?${params.toString()}`);
      });
    }, 300);
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {isPending && <span className="ml-2 text-xs text-gray-400">Buscando...</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 pr-4 font-medium">Nombre</th>
              <th className="pb-2 pr-4 font-medium">Email</th>
              <th className="pb-2 pr-4 font-medium text-right">Compras</th>
              <th className="pb-2 pr-4 font-medium text-right">Total gastado</th>
              <th className="pb-2 font-medium">Ultima compra</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.buyerEmail} className="border-b">
                <td className="py-2 pr-4 font-medium">{c.buyerName}</td>
                <td className="py-2 pr-4 text-gray-500">{c.buyerEmail}</td>
                <td className="py-2 pr-4 text-right">{c.totalPurchases}</td>
                <td className="py-2 pr-4 text-right">{formatMoney(c.totalSpent, currency)}</td>
                <td className="py-2 text-gray-500">
                  {formatDateTime(new Date(c.lastPurchase))}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
