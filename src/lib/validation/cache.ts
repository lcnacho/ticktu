const DB_NAME = "ticktu-validation";
const DB_VERSION = 1;
const MANIFEST_STORE = "manifest";
const PENDING_SCANS_STORE = "pending_scans";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MANIFEST_STORE)) {
        db.createObjectStore(MANIFEST_STORE, { keyPath: "qrHash" });
      }
      if (!db.objectStoreNames.contains(PENDING_SCANS_STORE)) {
        db.createObjectStore(PENDING_SCANS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export type ManifestEntry = {
  qrHash: string;
  status: string;
  ticketType: string;
  holderName: string;
};

export type PendingScan = {
  id?: number;
  qrHash: string;
  status: "valid" | "invalid" | "duplicate";
  operatorName: string;
  deviceId: string;
  scannedAt: string;
  eventId: string;
  tenantId: string;
  ticketId?: string;
};

export async function cacheManifest(entries: ManifestEntry[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(MANIFEST_STORE, "readwrite");
  const store = tx.objectStore(MANIFEST_STORE);
  store.clear();
  for (const entry of entries) {
    store.put(entry);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getManifestEntry(
  qrHash: string,
): Promise<ManifestEntry | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MANIFEST_STORE, "readonly");
    const request = tx.objectStore(MANIFEST_STORE).get(qrHash);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function markAsUsedLocally(qrHash: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(MANIFEST_STORE, "readwrite");
  const store = tx.objectStore(MANIFEST_STORE);
  const entry = await new Promise<ManifestEntry | null>((resolve, reject) => {
    const req = store.get(qrHash);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
  if (entry) {
    entry.status = "used";
    store.put(entry);
  }
}

export async function addPendingScan(scan: Omit<PendingScan, "id">): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PENDING_SCANS_STORE, "readwrite");
  tx.objectStore(PENDING_SCANS_STORE).add(scan);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingScans(): Promise<PendingScan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_SCANS_STORE, "readonly");
    const request = tx.objectStore(PENDING_SCANS_STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingScan(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PENDING_SCANS_STORE, "readwrite");
  tx.objectStore(PENDING_SCANS_STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
