"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Order } from "@/lib/db/schema/orders";
import { searchOrdersAction } from "@/lib/actions/admin";
import { OrderDetailSheet } from "@/components/admin/order-detail-sheet";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";

export function AdminOrdersClient() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<
    { id: string; holderName: string; holderEmail: string; status: string; ticketType: string }[]
  >([]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    const result = await searchOrdersAction(query.trim());
    setIsSearching(false);

    if (result.success) {
      setOrders(result.data);
      if (result.data.length === 0) {
        toast.info("No se encontraron ordenes");
      }
    } else {
      toast.error(result.error.message);
    }
  }, [query]);

  async function handleSelectOrder(order: Order) {
    // Fetch tickets for the order via API
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tickets?tenantId=${order.tenantId}`);
      if (res.ok) {
        const tickets = await res.json();
        setSelectedTickets(tickets);
      }
    } catch {
      setSelectedTickets([]);
    }
    setSelectedOrder(order);
  }

  return (
    <div>
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Buscar por nombre, email o payment ID..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Comprador</th>
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium text-right">Monto</th>
                <th className="pb-2 pr-4 font-medium">Estado</th>
                <th className="pb-2 pr-4 font-medium">Metodo</th>
                <th className="pb-2 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer border-b hover:bg-gray-50"
                  onClick={() => handleSelectOrder(order)}
                >
                  <td className="py-2 pr-4 font-medium">{order.buyerName}</td>
                  <td className="py-2 pr-4 text-gray-500">{order.buyerEmail}</td>
                  <td className="py-2 pr-4 text-right">
                    {formatMoney(order.totalAmount, order.currency)}
                  </td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "refunded"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 capitalize text-gray-500">{order.paymentMethod}</td>
                  <td className="py-2 text-gray-500">
                    {formatDateTime(new Date(order.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          tickets={selectedTickets}
          onClose={() => {
            setSelectedOrder(null);
            setSelectedTickets([]);
          }}
        />
      )}
    </div>
  );
}
