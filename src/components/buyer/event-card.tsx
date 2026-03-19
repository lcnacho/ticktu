import { formatDateTime } from "@/lib/utils/dates";

type BuyerEventCardProps = {
  name: string;
  date: Date | string;
  venue: string;
  imageUrl: string | null;
  href: string;
};

export function BuyerEventCard({
  name,
  date,
  venue,
  imageUrl,
  href,
}: BuyerEventCardProps) {
  return (
    <a
      href={href}
      className="block overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <p className="mt-1 text-sm text-gray-500">{formatDateTime(date)}</p>
        <p className="text-sm text-gray-500">{venue}</p>
        <div className="mt-3">
          <span className="inline-flex items-center rounded-md bg-[var(--producer-primary,#6366f1)] px-3 py-1.5 text-sm font-medium text-white">
            Comprar
          </span>
        </div>
      </div>
    </a>
  );
}
