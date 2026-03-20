import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getProducerBySlug } from "@/lib/db/queries/producers";
import { getPublishedEventBySlug } from "@/lib/db/queries/events";
import { getActiveTicketTypesByEvent } from "@/lib/db/queries/ticket-types";
import { ProducerHeader } from "@/components/buyer/producer-header";
import { PoweredByFooter } from "@/components/buyer/powered-by-footer";
import { TicketSelectorSection } from "@/components/buyer/ticket-selector-section";
import { formatDateTime } from "@/lib/utils/dates";

async function getEventPageData(producerSlug: string, eventSlug: string) {
  "use cache";

  const producer = await getProducerBySlug(producerSlug);
  if (!producer) return null;

  const event = await getPublishedEventBySlug(producer.tenantId, eventSlug);
  if (!event) return null;

  const ticketTypes = await getActiveTicketTypesByEvent(
    producer.tenantId,
    event.id,
  );

  cacheTag(`tenant-${producerSlug}`, `event-${event.id}`);

  return { producer, event, ticketTypes };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; eventSlug: string }>;
}): Promise<Metadata> {
  const { slug, eventSlug } = await params;
  const data = await getEventPageData(slug, eventSlug);

  if (!data) {
    return { title: "No encontrado" };
  }

  const { event, producer } = data;

  return {
    title: `${event.name} | ${producer.name}`,
    description: event.description ?? `${event.name} en ${event.venue}`,
    openGraph: {
      title: `${event.name} | ${producer.name}`,
      description: event.description ?? `${event.name} en ${event.venue}`,
      images: event.imageUrl ? [{ url: event.imageUrl }] : [],
    },
  };
}

async function PublicEventContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ slug: string; eventSlug: string }>;
  searchParamsPromise: Promise<{ ref?: string }>;
}) {
  const { slug, eventSlug } = await paramsPromise;
  const { ref: rrppRef } = await searchParamsPromise;
  const data = await getEventPageData(slug, eventSlug);

  if (!data) {
    notFound();
  }

  const { producer, event, ticketTypes } = data;

  return (
    <>
      <ProducerHeader name={producer.name} logoUrl={producer.logoUrl} />

      <main className="px-4 py-6 pb-32">
        <div className="mb-4">
          <a
            href="/"
            className="text-sm text-[var(--producer-primary,#6366f1)] hover:opacity-80"
          >
            &larr; Volver a eventos
          </a>
        </div>

        {event.imageUrl && (
          <div className="mb-6 overflow-hidden rounded-lg">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold">{event.name}</h1>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Fecha:</span>
            <span>{formatDateTime(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Lugar:</span>
            <span>{event.venue}</span>
          </div>
        </div>

        {event.description && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Descripcion</h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {event.description}
            </p>
          </div>
        )}

        <TicketSelectorSection
          eventSlug={eventSlug}
          ticketTypes={ticketTypes}
          currency={producer.currency}
          feePercentage={producer.feePercentage}
          feeFixed={producer.feeFixed}
          rrppRef={rrppRef}
        />
      </main>

      <PoweredByFooter />
    </>
  );
}

export default function PublicEventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; eventSlug: string }>;
  searchParams: Promise<{ ref?: string }>;
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
        <PublicEventContent
          paramsPromise={params}
          searchParamsPromise={searchParams}
        />
      </Suspense>
    </div>
  );
}
