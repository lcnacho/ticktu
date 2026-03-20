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
import { getOrdersByEvent } from "@/lib/db/queries/orders";
import {
  getPromotersByTenant,
  getRRPPPerformanceByEvent,
} from "@/lib/db/queries/rrpp";
import { getCheckinStats } from "@/lib/db/queries/validation";
import {
  getEventSettlement,
  getPerEventFinanceSummary,
} from "@/lib/db/queries/analytics";
import { getExpensesByEvent } from "@/lib/db/queries/expenses";
import type { Event, EventStatus } from "@/lib/db/schema/events";
import type { Batch } from "@/lib/db/schema/batches";
import { EventStatusBadge } from "@/components/dashboard/event-status-badge";
import { EventActions } from "@/components/dashboard/event-actions";
import { EventEditForm } from "@/components/dashboard/event-edit-form";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";
import { TicketTypeList } from "@/components/dashboard/ticket-type-list";
import { CortesiasTab } from "@/components/dashboard/cortesias-tab";
import { EventVentasTab } from "@/components/dashboard/event-ventas-tab";
import { EventRRPPTab } from "@/components/dashboard/event-rrpp-tab";
import { EventCheckinsTab } from "@/components/dashboard/event-checkins-tab";
import { EventFinanzasTab } from "@/components/dashboard/event-finanzas-tab";
import { formatDateTime } from "@/lib/utils/dates";

type Tab = {
  key: string;
  label: string;
  enabled: boolean;
};

const TABS: Tab[] = [
  { key: "general", label: "General", enabled: true },
  { key: "configuracion", label: "Configuracion", enabled: true },
  { key: "ventas", label: "Ventas", enabled: true },
  { key: "rrpp", label: "RRPP", enabled: true },
  { key: "cortesias", label: "Cortesias", enabled: true },
  { key: "checkins", label: "Check-ins", enabled: true },
  { key: "finanzas", label: "Finanzas", enabled: true },
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

  if (!user) notFound();

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) notFound();

  const event = await getEventById(tenantId, eventId);
  if (!event) notFound();

  const producer = await getProducerByTenantId(tenantId);
  if (!producer) notFound();
  const currency = producer.currency;
  const feePercentage = producer.feePercentage;
  const feeFixed = producer.feeFixed;

  // Load ticket types + batches only for tabs that need them
  const needsTicketTypes = ["configuracion", "cortesias"].includes(currentTab);
  const allTicketTypes = needsTicketTypes
    ? await getTicketTypesByEvent(tenantId, eventId)
    : [];

  const batchesByType: Record<string, Batch[]> = {};
  if (currentTab === "configuracion") {
    await Promise.all(
      allTicketTypes.map(async (tt) => {
        batchesByType[tt.id] = await getBatchesByTicketType(tenantId, tt.id);
      }),
    );
  }

  // Load cortesias data only for cortesias tab
  const complimentaryTickets = currentTab === "cortesias"
    ? await getComplimentaryTickets(tenantId, eventId)
    : [];
  const countByType = currentTab === "cortesias"
    ? await getComplimentaryCountByType(tenantId, eventId)
    : [];

  // Load tab-specific data only when needed
  const orders = currentTab === "ventas"
    ? await getOrdersByEvent(tenantId, eventId)
    : [];

  const [promoters, rrppPerformance] = currentTab === "rrpp"
    ? await Promise.all([
        getPromotersByTenant(tenantId),
        getRRPPPerformanceByEvent(tenantId, eventId),
      ])
    : [[], []];

  const checkinStats = currentTab === "checkins"
    ? await getCheckinStats(tenantId, eventId)
    : null;

  const [settlement, perEventFinance, eventExpenses] = currentTab === "finanzas"
    ? await Promise.all([
        getEventSettlement(tenantId, eventId),
        getPerEventFinanceSummary(tenantId, eventId),
        getExpensesByEvent(tenantId, eventId),
      ])
    : [null, null, []];

  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://ticktu.com"}/${producer?.slug}/events/${event.slug}`;

  return (
    <>
      <div className="mb-2">
        <a
          href="/dashboard/events"
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

      {currentTab === "ventas" && (
        <EventVentasTab orders={orders} currency={currency} />
      )}

      {currentTab === "rrpp" && (
        <EventRRPPTab
          eventId={event.id}
          promoters={promoters}
          performance={rrppPerformance}
          currency={currency}
          baseUrl={baseUrl}
        />
      )}

      {currentTab === "cortesias" && (
        <CortesiasTab
          eventId={event.id}
          tickets={complimentaryTickets}
          ticketTypes={allTicketTypes}
          countByType={countByType}
        />
      )}

      {currentTab === "checkins" && checkinStats && (
        <EventCheckinsTab stats={checkinStats} />
      )}

      {currentTab === "finanzas" && settlement && perEventFinance && (
        <EventFinanzasTab
          eventId={event.id}
          eventStatus={event.status as EventStatus}
          settlement={settlement}
          perEventFinance={perEventFinance}
          expenses={eventExpenses}
          currency={currency}
        />
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
