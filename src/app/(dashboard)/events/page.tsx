import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getEventsByTenant,
  searchEventsByTenant,
} from "@/lib/db/queries/events";
import type { Event, EventStatus } from "@/lib/db/schema/events";
import { EventCard } from "@/components/dashboard/event-card";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";
import { EventSearch } from "@/components/dashboard/event-search";
import { EmptyState } from "@/components/shared/empty-state";

type Tab = {
  key: string;
  label: string;
  statuses: EventStatus[];
};

const TABS: Tab[] = [
  { key: "activos", label: "Activos", statuses: ["published"] },
  { key: "borradores", label: "Borradores", statuses: ["draft"] },
  {
    key: "finalizados",
    label: "Finalizados",
    statuses: ["finished", "archived"],
  },
];

async function EventListContent({
  tab,
  query,
}: {
  tab: string;
  query: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <EmptyState
        variant="error"
        title="No autenticado"
        description="Inicia sesion para ver tus eventos."
      />
    );
  }

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    return (
      <EmptyState
        variant="error"
        title="Sin acceso"
        description="No tienes acceso a un tenant."
      />
    );
  }

  let events: Event[];

  if (query) {
    events = await searchEventsByTenant(tenantId, query);
  } else {
    const currentTab = TABS.find((t) => t.key === tab) ?? TABS[0];
    const allEvents: Event[] = [];
    for (const status of currentTab.statuses) {
      const statusEvents = await getEventsByTenant(tenantId, status);
      allEvents.push(...statusEvents);
    }
    allEvents.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    events = allEvents;
  }

  if (events.length === 0) {
    const isFirstUse = tab === "activos";
    return (
      <EmptyState
        variant={
          query ? "no-results" : isFirstUse ? "first-use" : "no-results"
        }
        title={
          query
            ? "Sin resultados"
            : isFirstUse
              ? "Crea tu primer evento"
              : "No hay eventos"
        }
        description={
          query
            ? `No se encontraron eventos para "${query}".`
            : isFirstUse
              ? "Comienza creando tu primer evento para empezar a vender entradas."
              : "No hay eventos en esta categoria."
        }
        action={
          !query && isFirstUse
            ? { label: "Crear evento", href: "/events/new" }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

async function EventsPageContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParamsPromise;
  const currentTab = params.tab ?? "activos";
  const query = params.q ?? "";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <a
          href="/dashboard/events/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Crear evento
        </a>
      </div>

      <div className="mb-4">
        <EventSearch />
      </div>

      {!query && (
        <div className="mb-6 flex gap-1 border-b">
          {TABS.map((tab) => (
            <a
              key={tab.key}
              href={`?tab=${tab.key}`}
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                currentTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      )}

      <Suspense fallback={<EventListSkeleton />}>
        <EventListContent tab={currentTab} query={query} />
      </Suspense>
    </>
  );
}

export default function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <EventsPageContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
