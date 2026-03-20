import type { Event } from "@/lib/db/schema/events";
import type { EventStatus } from "@/lib/db/schema/events";
import { EventStatusBadge } from "@/components/dashboard/event-status-badge";
import { formatDateTime } from "@/lib/utils/dates";

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <a
      href={`/dashboard/events/${event.id}`}
      className="block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {event.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{event.venue}</p>
          <p className="mt-1 text-sm text-gray-400">
            {formatDateTime(event.date)}
          </p>
        </div>
        <div className="flex-shrink-0">
          <EventStatusBadge status={event.status as EventStatus} />
        </div>
      </div>
      {event.description && (
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {event.description}
        </p>
      )}
    </a>
  );
}
