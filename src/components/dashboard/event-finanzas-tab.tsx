import { formatMoney } from "@/lib/utils/money";
import type { Expense } from "@/lib/db/schema/expenses";
import type { EventStatus } from "@/lib/db/schema/events";

type SettlementData = {
  ticketBreakdown: {
    ticketTypeName: string;
    unitPrice: number;
    soldCount: number;
    maxCapacity: number;
  }[];
  complimentaryCount: number;
  grossRevenue: number;
  totalFees: number;
  netEarnings: number;
};

type PerEventFinance = {
  revenue: number;
  expenses: number;
  balance: number;
};

type EventFinanzasTabProps = {
  eventId: string;
  eventStatus: EventStatus;
  settlement: SettlementData;
  perEventFinance: PerEventFinance;
  expenses: Expense[];
  currency: string;
};

export function EventFinanzasTab({
  eventStatus,
  settlement,
  perEventFinance,
  expenses,
  currency,
}: EventFinanzasTabProps) {
  const isFinished = eventStatus === "finished" || eventStatus === "archived";

  return (
    <div className="space-y-6">
      {/* Per-event balance */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-xl font-bold">{formatMoney(perEventFinance.revenue, currency)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Gastos</p>
          <p className="text-xl font-bold">{formatMoney(perEventFinance.expenses, currency)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Balance</p>
          <p
            className={`text-xl font-bold ${perEventFinance.balance >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatMoney(perEventFinance.balance, currency)}
          </p>
        </div>
      </div>

      {/* Expense list */}
      {expenses.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-gray-500">Gastos del evento</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Descripcion</th>
                  <th className="pb-2 pr-4 font-medium">Categoria</th>
                  <th className="pb-2 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b">
                    <td className="py-2 pr-4">{e.description}</td>
                    <td className="py-2 pr-4 capitalize text-gray-500">{e.category}</td>
                    <td className="py-2 text-right">{formatMoney(e.amountCents, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settlement report (only for finished events) */}
      {isFinished && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <h2 className="mb-4 text-lg font-semibold">Reporte de Liquidacion</h2>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">Desglose por tipo de entrada</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Tipo</th>
                    <th className="pb-2 pr-4 font-medium text-right">Precio</th>
                    <th className="pb-2 pr-4 font-medium text-right">Vendidos</th>
                    <th className="pb-2 font-medium text-right">Capacidad</th>
                  </tr>
                </thead>
                <tbody>
                  {settlement.ticketBreakdown.map((row) => (
                    <tr key={row.ticketTypeName} className="border-b">
                      <td className="py-2 pr-4 font-medium">{row.ticketTypeName}</td>
                      <td className="py-2 pr-4 text-right">{formatMoney(row.unitPrice, currency)}</td>
                      <td className="py-2 pr-4 text-right">{row.soldCount}</td>
                      <td className="py-2 text-right text-gray-500">{row.maxCapacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {settlement.complimentaryCount > 0 && (
              <p className="text-sm text-gray-500">
                Cortesias emitidas: {settlement.complimentaryCount}
              </p>
            )}

            <div className="mt-4 space-y-1 border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ingreso bruto</span>
                <span>{formatMoney(settlement.grossRevenue, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fees cobrados</span>
                <span>{formatMoney(settlement.totalFees, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Ingreso neto productor</span>
                <span>{formatMoney(settlement.netEarnings, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isFinished && (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-400">
            El reporte de liquidacion estara disponible cuando el evento finalice.
          </p>
        </div>
      )}
    </div>
  );
}
