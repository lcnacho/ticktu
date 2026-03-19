import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/db/queries/events";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { getTicketTypesByEvent } from "@/lib/db/queries/ticket-types";
import { getBatchesByTicketType } from "@/lib/db/queries/batches";
import {
  getComplimentaryTickets,
  getComplimentaryCountByType,
} from "@/lib/db/queries/tickets";
import type { Event, EventStatus } from "@/lib/db/schema/events";
import type { Batch } from "@/lib/db/schema/batches";
import { EventStatusBadge } from "@/components/dashboard/event-status-badge";
import { EventActions } from "@/components/dashboard/event-actions";
import { EventEditForm } from "@/components/dashboard/event-edit-form";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";
import { TicketTypeList } from "@/components/dashboard/ticket-type-list";
import { CortesiasTab } from "@/components/dashboard/cortesias-tab";
import { formatDateTime } from "@/lib/utils/dates";

type Tab = {
  key: string;
  label: string;
  enabled: boolean;
};

const TABS: Tab[] = [
  { key: "general", label: "General", enabled: true },
  { key: "configuracion", label: "Configuracion", enabled: true },
  { key: "ventas", label: "Ventas", enabled: false },
  { key: "rrpp", label: "RRPP", enabled: false },
  { key: "cortesias", label: "Cortesias", enabled: true },
  { key: "checkins", label: "Check-ins", enabled: false },
  { key: "finanzas", label: "Finanzas", enabled: false },
];

async function EventDetailContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ eventId: string }>;
  searchParamsPromise: Promise<{ tab?: string }>;
}) {
  const { eventId } = await paramsPromise;
  const { tab: currentTab = "general" } = await searchParamsPromise;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    notFound();
  }

  const event = await getEventById(tenantId, eventId);
  if (!event) {
    notFound();
  }

  const producer = await getProducerByTenantId(tenantId);
  const currency = producer?.currency ?? "UYU";
  const feePercentage = producer?.feePercentage ?? 5;
  const feeFixed = producer?.feeFixed ?? 0;

  // Load ticket types for configuracion and cortesias tabs
  const allTicketTypes = await getTicketTypesByEvent(tenantId, eventId);

  // Load batches for each ticket type
  const batchesByType: Record<string, Batch[]> = {};
  await Promise.all(
    allTicketTypes.map(async (tt) => {
      batchesByType[tt.id] = await getBatchesByTicketType(tenantId, tt.id);
    }),
  );

  // Load cortesias data
  const complimentaryTickets = await getComplimentaryTickets(tenantId, eventId);
  const countByType = await getComplimentaryCountByType(tenantId, eventId);

  return (
    <>
      <div className="mb-2">
        <a
          href="/events"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Volver a eventos
        </a>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <EventStatusBadge status={event.status as EventStatus} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {event.venue} &middot; {formatDateTime(event.date)}
          </p>
        </div>
        <EventActions
          eventId={event.id}
          currentStatus={event.status as EventStatus}
        />
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <a
            key={tab.key}
            href={tab.enabled ? `?tab=${tab.key}` : "#"}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              currentTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : tab.enabled
                  ? "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  : "cursor-not-allowed border-transparent text-gray-300"
            }`}
            aria-disabled={!tab.enabled}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {currentTab === "general" && <EventGeneralTab event={event} />}

      {currentTab === "configuracion" && (
        <div className="space-y-8">
          <EventEditForm
            eventId={event.id}
            defaultValues={{
              name: event.name,
              slug: event.slug,
              date: event.date.toISOString().slice(0, 16),
              venue: event.venue,
              description: event.description ?? "",
              imageUrl: event.imageUrl ?? "",
            }}
          />
          <hr />
          <TicketTypeList
            eventId={event.id}
            ticketTypes={allTicketTypes}
            batchesByType={batchesByType}
            currency={currency}
            feePercentage={feePercentage}
            feeFixed={feeFixed}
          />
        </div>
      )}

      {currentTab === "cortesias" && (
        <CortesiasTab
          eventId={event.id}
          tickets={complimentaryTickets}
          ticketTypes={allTicketTypes}
          countByType={countByType}
        />
      )}

      {!["general", "configuracion", "cortesias"].includes(currentTab) && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-400">
            Esta seccion estara disponible proximamente.
          </p>
        </div>
      )}
    </>
  );
}

function EventGeneralTab({ event }: { event: Event }) {
  return (
    <div className="space-y-6">
      {event.imageUrl && (
        <div className="overflow-hidden rounded-lg">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
          <p className="mt-1">{event.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Slug</h3>
          <p className="mt-1 font-mono text-sm">{event.slug}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Fecha y hora</h3>
          <p className="mt-1">{formatDateTime(event.date)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Lugar</h3>
          <p className="mt-1">{event.venue}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Estado</h3>
          <div className="mt-1">
            <EventStatusBadge status={event.status as EventStatus} />
          </div>
        </div>
      </div>

      {event.description && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">Descripcion</h3>
          <p className="mt-1 whitespace-pre-wrap text-gray-700">
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <EventDetailContent
          paramsPromise={params}
          searchParamsPromise={searchParams}
        />
      </Suspense>
    </div>
  );
}
