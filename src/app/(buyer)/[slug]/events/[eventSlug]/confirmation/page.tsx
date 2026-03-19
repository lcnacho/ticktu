import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProducerBySlug } from "@/lib/db/queries/producers";
import { getOrderById, getOrderItemsByOrder } from "@/lib/db/queries/orders";
import { getEventById } from "@/lib/db/queries/events";
import { getTicketTypeById } from "@/lib/db/queries/ticket-types";
import { ProducerHeader } from "@/components/buyer/producer-header";
import { PoweredByFooter } from "@/components/buyer/powered-by-footer";
import { formatMoney } from "@/lib/utils/money";
import { formatDateTime } from "@/lib/utils/dates";
import { CircleCheck, Clock } from "lucide-react";

async function ConfirmationContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string; eventSlug: string }>;
  searchParamsPromise: Promise<{ orderId?: string; status?: string }>;
}) {
  const { slug } = await paramsPromise;
  const { orderId, status } = await searchParamsPromise;

  if (!orderId) notFound();

  const producer = await getProducerBySlug(slug);
  if (!producer) notFound();

  const order = await getOrderById(producer.tenantId, orderId);
  if (!order) notFound();

  const event = await getEventById(producer.tenantId, order.eventId);
  const orderItems = await getOrderItemsByOrder(producer.tenantId, order.id);

  // Resolve ticket type names
  const itemsWithNames = await Promise.all(
    orderItems.map(async (item) => {
      const tt = await getTicketTypeById(producer.tenantId, item.ticketTypeId);
      return { ...item, ticketTypeName: tt?.name ?? "Entrada" };
    }),
  );

  const isPending = status === "pending" || order.status === "pending";

  return (
    <>
      <ProducerHeader name={producer.name} logoUrl={producer.logoUrl} />

      <main className="px-4 py-8">
        <div className="mb-6 text-center">
          {isPending ? (
            <>
              <Clock className="mx-auto mb-3 size-12 text-amber-500" />
              <h1 className="text-xl font-bold">Pago pendiente</h1>
              <p className="mt-2 text-sm text-gray-500">
                Tu pago esta siendo procesado. Recibiras un email de confirmacion
                cuando se acredite.
              </p>
            </>
          ) : (
            <>
              <CircleCheck className="mx-auto mb-3 size-12 text-green-500" />
              <h1 className="text-xl font-bold">Compra confirmada</h1>
              <p className="mt-2 text-sm text-gray-500">
                Recibiras tus entradas con QR por email en los proximos minutos.
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          {event && (
            <div className="rounded-lg border p-4">
              <p className="text-sm text-gray-500">Evento</p>
              <p className="font-semibold">{event.name}</p>
              <p className="text-sm text-gray-500">
                {formatDateTime(event.date)} &middot; {event.venue}
              </p>
            </div>
          )}

          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm text-gray-500">Comprador</p>
            <p className="font-medium">{order.buyerName}</p>
            <p className="text-sm text-gray-500">{order.buyerEmail}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-2 text-sm text-gray-500">Detalle</p>
            {itemsWithNames.map((item) => (
              <div key={item.id} className="flex justify-between py-1 text-sm">
                <span>{item.ticketTypeName}</span>
                <span>{formatMoney(item.unitPrice + item.feeAmount, order.currency)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.totalAmount, order.currency)}</span>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Orden</p>
            <p className="font-mono text-xs text-gray-400">{order.id}</p>
          </div>
        </div>
      </main>

      <PoweredByFooter />
    </>
  );
}

export default function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; eventSlug: string }>;
  searchParams: Promise<{ orderId?: string; status?: string }>;
}) {
  return (
    <div className="mx-auto max-w-[480px]">
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        }
      >
        <ConfirmationContent paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
