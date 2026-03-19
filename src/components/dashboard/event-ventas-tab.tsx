import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";
import type { Order } from "@/lib/db/schema/orders";

type EventVentasTabProps = {
  orders: Order[];
  currency: string;
};

export function EventVentasTab({ orders, currency }: EventVentasTabProps) {
  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Ordenes pagadas</p>
          <p className="text-2xl font-bold">{paidOrders.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-2xl font-bold">{formatMoney(totalRevenue, currency)}</p>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Comprador</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium text-right">Monto</th>
                <th className="pb-2 pr-4 font-medium">Metodo</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-2 pr-4 font-medium">{order.buyerName}</td>
                  <td className="py-2 pr-4 text-gray-500">{order.buyerEmail}</td>
                  <td className="py-2 pr-4 text-right">
                    {formatMoney(order.totalAmount, currency)}
                  </td>
                  <td className="py-2 pr-4 capitalize text-gray-500">{order.paymentMethod}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {formatDateTime(new Date(order.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-gray-400">Sin ventas para este evento</p>
      )}
    </div>
  );
}
