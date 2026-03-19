import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProducerBySlug } from "@/lib/db/queries/producers";
import { getPublishedEventBySlug } from "@/lib/db/queries/events";
import { getActiveTicketTypesByEvent } from "@/lib/db/queries/ticket-types";
import { ProducerHeader } from "@/components/buyer/producer-header";
import { CheckoutForm } from "@/components/buyer/checkout-form";

async function CheckoutContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string; eventSlug: string }>;
  searchParamsPromise: Promise<{ items?: string; ref?: string; orderId?: string; status?: string }>;
}) {
  const { slug, eventSlug } = await paramsPromise;
  const { items: itemsParam, ref: rrppRef, status } = await searchParamsPromise;

  const producer = await getProducerBySlug(slug);
  if (!producer) notFound();

  const event = await getPublishedEventBySlug(producer.tenantId, eventSlug);
  if (!event) notFound();

  const ticketTypes = await getActiveTicketTypesByEvent(producer.tenantId, event.id);

  // Parse items from query param: "typeId:qty,typeId:qty"
  const parsedItems: { ticketTypeId: string; quantity: number }[] = [];
  if (itemsParam) {
    for (const part of itemsParam.split(",")) {
      const [ticketTypeId, qtyStr] = part.split(":");
      const quantity = parseInt(qtyStr, 10);
      if (ticketTypeId && quantity > 0) {
        parsedItems.push({ ticketTypeId, quantity });
      }
    }
  }

  if (parsedItems.length === 0) {
    notFound();
  }

  return (
    <>
      <ProducerHeader name={producer.name} logoUrl={producer.logoUrl} />

      <main className="px-4 pb-32 pt-6">
        <div className="mb-4">
          <a
            href={`/${slug}/events/${eventSlug}`}
            className="text-sm text-[var(--producer-primary,#6366f1)] hover:opacity-80"
          >
            &larr; Volver al evento
          </a>
        </div>

        <h1 className="mb-6 text-xl font-bold">{event.name}</h1>

        {status === "failure" && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            El pago no se pudo procesar. Podes intentar nuevamente.
          </div>
        )}

        <CheckoutForm
          producerSlug={slug}
          eventId={event.id}
          ticketTypes={ticketTypes}
          items={parsedItems}
          currency={producer.currency}
          feePercentage={producer.feePercentage}
          feeFixed={producer.feeFixed}
          rrppRef={rrppRef}
        />
      </main>
    </>
  );
}

export default function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; eventSlug: string }>;
  searchParams: Promise<{ items?: string; ref?: string; orderId?: string; status?: string }>;
}) {
  return (
    <div className="mx-auto max-w-[480px]">
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-gray-400">Cargando checkout...</p>
          </div>
        }
      >
        <CheckoutContent paramsPromise={params} searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
