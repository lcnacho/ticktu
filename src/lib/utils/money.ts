export function calculateServiceFee(
  priceCents: number,
  feePercentage: number,
  feeFixedCents: number,
): number {
  if (priceCents <= 0) return 0;
  const percentageFee = Math.round((priceCents * feePercentage) / 100);
  return Math.max(percentageFee, feeFixedCents);
}

export function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
