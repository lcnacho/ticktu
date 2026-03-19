"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/validation/qr-scanner";
import { ScanResultOverlay } from "@/components/validation/scan-result-overlay";
import { ConnectionStatus } from "@/components/validation/connection-status";

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
  const [scanCount, setScanCount] = useState(0);
  const processingRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("validation_session");
    if (!stored) {
      router.replace("/validacion");
      return;
    }
    setSession(JSON.parse(stored) as SessionData);
  }, [router]);

  const handleScan = useCallback(
    async (decodedText: string) => {
      if (!session || processingRef.current) return;
      processingRef.current = true;

      if (!navigator.onLine) {
        setScanResult({ valid: false, reason: "Sin conexion" });
        return;
      }

      try {
        const res = await fetch("/api/validation/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrHash: decodedText,
            operatorName: session.operatorName,
            deviceId: session.deviceId,
            scannedAt: new Date().toISOString(),
            eventId: session.eventId,
            tenantId: session.tenantId,
          }),
        });

        const data = await res.json();

        if (res.ok && data.status === "valid") {
          setScanResult({
            valid: true,
            holderName: data.holderName,
            ticketType: data.ticketType,
          });
        } else {
          setScanResult({
            valid: false,
            reason: data.reason ?? "Entrada no valida",
            holderName: data.holderName,
            ticketType: data.ticketType,
          });
        }
      } catch {
        setScanResult({ valid: false, reason: "Error de conexion" });
      }

      setScanCount((c) => c + 1);
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
      <ConnectionStatus />
      <div className="flex items-center justify-between bg-gray-900 px-4 py-3">
        <span className="text-sm font-medium text-white">{session.operatorName}</span>
        <span className="text-sm text-gray-400">{scanCount} escaneos</span>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <QRScanner onScan={handleScan} enabled={!scanResult} />
      </div>

      {scanResult && <ScanResultOverlay result={scanResult} onDismiss={handleDismiss} />}
    </div>
  );
}
