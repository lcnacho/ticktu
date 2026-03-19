import type { EventStatus } from "@/lib/db/schema/events";

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  finished: "Finalizado",
  archived: "Archivado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<EventStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  finished: "bg-blue-100 text-blue-700",
  archived: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

type EventStatusBadgeProps = {
  status: EventStatus;
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
