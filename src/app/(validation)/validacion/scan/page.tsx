"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/validation/qr-scanner";
import { ScanResultOverlay } from "@/components/validation/scan-result-overlay";
import {
  getManifestEntry,
  markAsUsedLocally,
  addPendingScan,
} from "@/lib/validation/cache";
import { fetchAndCacheManifest, syncPendingScans } from "@/lib/validation/sync";

type ScanResult = {
  valid: boolean;
  holderName?: string;
  ticketType?: string;
  reason?: string;
};

type SessionData = {
  eventId: string;
  tenantId: string;
  operatorName: string;
  deviceId: string;
};

export default function ScanPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const processingRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("validation_session");
    if (!stored) {
      router.replace("/validacion");
      return;
    }
    const data = JSON.parse(stored) as SessionData;
    setSession(data);

    fetchAndCacheManifest(data.eventId).catch(() => {});

    // Refresh manifest every 30s while online to capture last-minute purchases
    const refreshInterval = setInterval(() => {
      if (navigator.onLine) {
        fetchAndCacheManifest(data.eventId).catch(() => {});
      }
    }, 30000);

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingScans().catch(() => {});
      fetchAndCacheManifest(data.eventId).catch(() => {});
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (!session || processingRef.current) return;
      processingRef.current = true;

      const qrHash = decodedText;
      const entry = await getManifestEntry(qrHash);

      let result: ScanResult;
      let scanStatus: "valid" | "invalid" | "duplicate";

      if (!entry) {
        result = { valid: false, reason: "Entrada no encontrada" };
        scanStatus = "invalid";
      } else if (entry.status === "used") {
        result = { valid: false, reason: "Ya utilizada", holderName: entry.holderName, ticketType: entry.ticketType };
        scanStatus = "duplicate";
      } else if (entry.status === "cancelled") {
        result = { valid: false, reason: "Entrada cancelada" };
        scanStatus = "invalid";
      } else {
        result = { valid: true, holderName: entry.holderName, ticketType: entry.ticketType };
        scanStatus = "valid";
        await markAsUsedLocally(qrHash);
      }

      setScanResult(result);
      setScanCount((c) => c + 1);

      const scanRecord = {
        qrHash,
        status: scanStatus,
        operatorName: session.operatorName,
        deviceId: session.deviceId,
        scannedAt: new Date().toISOString(),
        eventId: session.eventId,
        tenantId: session.tenantId,
      };

      if (navigator.onLine) {
        try {
          await fetch("/api/validation/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scanRecord),
          });
        } catch {
          await addPendingScan(scanRecord);
        }
      } else {
        await addPendingScan(scanRecord);
      }
    },
    [session],
  );

  const handleDismiss = useCallback(() => {
    setScanResult(null);
    processingRef.current = false;
  }, []);

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{session.operatorName}</span>
          {!isOnline && (
            <>
              <span className="size-2 rounded-full bg-yellow-400" title="Sin conexion" />
              <span className="text-xs text-yellow-400">Sin conexión</span>
            </>
          )}
        </div>
        <span className="text-sm text-gray-400">{scanCount} escaneos</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <QRScanner onScan={handleScan} enabled={!scanResult} />
      </div>

      {scanResult && <ScanResultOverlay result={scanResult} onDismiss={handleDismiss} />}
    </div>
  );
}
