import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducerByTenantId } from "@/lib/db/queries/producers";
import { getEventsByTenant } from "@/lib/db/queries/events";
import { getActiveTicketTypesByEvent } from "@/lib/db/queries/ticket-types";
import { BoleteriaForm } from "@/components/dashboard/boleteria-form";
import { EventListSkeleton } from "@/components/dashboard/event-list-skeleton";
import type { TicketType } from "@/lib/db/schema/ticket-types";

async function BoleteriaContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) notFound();

  const producer = await getProducerByTenantId(tenantId);
  const currency = producer?.currency ?? "UYU";

  // Only show published events for POS
  const events = await getEventsByTenant(tenantId, "published");

  const ticketTypesByEvent: Record<string, TicketType[]> = {};
  await Promise.all(
    events.map(async (ev) => {
      ticketTypesByEvent[ev.id] = await getActiveTicketTypesByEvent(tenantId, ev.id);
    }),
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Boleteria</h1>
        <p className="text-sm text-gray-500">Venta en puerta — efectivo o transferencia</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-400">
            No hay eventos publicados para vender entradas.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-lg">
          <BoleteriaForm
            events={events}
            ticketTypesByEvent={ticketTypesByEvent}
            currency={currency}
          />
        </div>
      )}
    </>
  );
}

export default function BoleteriaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Suspense fallback={<EventListSkeleton />}>
        <BoleteriaContent />
      </Suspense>
    </div>
  );
}
