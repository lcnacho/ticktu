const dateFormatter = new Intl.DateTimeFormat("es-UY", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-UY", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Montevideo",
});

const relativeFormatter = new Intl.RelativeTimeFormat("es-UY", {
  numeric: "auto",
});

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

function toDate(date: Date | string): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function formatDate(date: Date | string): string {
  return dateFormatter.format(toDate(date));
}

export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(toDate(date));
}

export function formatRelative(date: Date | string): string {
  let duration = (toDate(date).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return relativeFormatter.format(Math.round(duration), "years");
}
