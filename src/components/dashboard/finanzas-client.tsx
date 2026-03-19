"use client";

import { useState } from "react";
import type { Expense } from "@/lib/db/schema/expenses";
import type { Event } from "@/lib/db/schema/events";
import { ExpenseDialog } from "@/components/dashboard/expense-dialog";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";

type FinanzasClientProps = {
  expenses: Expense[];
  events: Event[];
  currency: string;
};

export function FinanzasClient({ expenses, events, currency }: FinanzasClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Gastos</h2>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Nuevo gasto
        </button>
      </div>

      {expenses.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Sin gastos registrados</p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Descripcion</th>
                <th className="pb-2 pr-4 font-medium">Categoria</th>
                <th className="pb-2 pr-4 font-medium text-right">Monto</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 pr-4">{e.description}</td>
                  <td className="py-2 pr-4 capitalize text-gray-500">{e.category}</td>
                  <td className="py-2 pr-4 text-right">{formatMoney(e.amountCents, currency)}</td>
                  <td className="py-2 text-gray-500">
                    {formatDateTime(new Date(e.expenseDate))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        events={events}
      />
    </div>
  );
}
