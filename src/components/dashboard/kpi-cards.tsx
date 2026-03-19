"use client";

import { formatMoney } from "@/lib/utils/money";

type KPICardsProps = {
  ticketsSold: number;
  revenue: number;
  expenses: number;
  balance: number;
  activeEvents: number;
  currency: string;
};

export function KPICards({
  ticketsSold,
  revenue,
  expenses,
  balance,
  activeEvents,
  currency,
}: KPICardsProps) {
  const cards = [
    { label: "Tickets Vendidos", value: String(ticketsSold), color: "" },
    { label: "Ingresos", value: formatMoney(revenue, currency), color: "" },
    { label: "Gastos", value: formatMoney(expenses, currency), color: "" },
    {
      label: "Balance",
      value: formatMoney(balance, currency),
      color: balance >= 0 ? "text-green-600" : "text-red-600",
    },
    { label: "Eventos Activos", value: String(activeEvents), color: "" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
