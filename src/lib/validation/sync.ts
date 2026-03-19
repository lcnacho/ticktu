import {
  cacheManifest,
  getPendingScans,
  removePendingScan,
  type ManifestEntry,
} from "./cache";

export async function fetchAndCacheManifest(eventId: string): Promise<void> {
  const res = await fetch(`/api/validation/manifest?eventId=${eventId}`);
  if (!res.ok) throw new Error("Failed to fetch manifest");

  const data: ManifestEntry[] = await res.json();
  await cacheManifest(data);
}

export async function syncPendingScans(): Promise<number> {
  const pending = await getPendingScans();
  let synced = 0;

  for (const scan of pending) {
    try {
      const res = await fetch("/api/validation/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrHash: scan.qrHash,
          eventId: scan.eventId,
          tenantId: scan.tenantId,
          operatorName: scan.operatorName,
          deviceId: scan.deviceId,
          scannedAt: scan.scannedAt,
          status: scan.status,
        }),
      });

      if (res.ok && scan.id != null) {
        await removePendingScan(scan.id);
        synced++;
      }
    } catch {
      // Offline — stop trying
      break;
    }
  }

  return synced;
}
