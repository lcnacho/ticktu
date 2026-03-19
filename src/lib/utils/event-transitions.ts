import type { EventStatus } from "@/lib/db/schema/events";

export const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ["published"],
  published: ["finished"],
  finished: ["archived"],
  archived: [],
  cancelled: [],
};

export function canTransition(
  currentStatus: EventStatus,
  targetStatus: EventStatus,
): boolean {
  const validNext = VALID_TRANSITIONS[currentStatus] ?? [];
  return validNext.includes(targetStatus);
}

export function getValidTransitions(currentStatus: EventStatus): EventStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}
