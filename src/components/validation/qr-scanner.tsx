"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type QRScannerProps = {
  onScan: (decodedText: string) => void;
  enabled: boolean;
};

export function QRScanner({ onScan, enabled }: QRScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<unknown>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");

  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || html5QrCodeRef.current) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanRef.current(decodedText);
        },
        () => {
          // ignore scan errors
        },
      );

      setStatus("scanning");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startScanner();
    }

    return () => {
      const scanner = html5QrCodeRef.current as { stop?: () => Promise<void> } | null;
      if (scanner?.stop) {
        scanner.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, [enabled, startScanner]);

  return (
    <div className="relative">
      <div id="qr-reader" ref={scannerRef} className="overflow-hidden rounded-lg" />
      {status === "loading" && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-gray-400">Iniciando camara...</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-red-500">
            No se pudo acceder a la camara. Verifica los permisos.
          </p>
        </div>
      )}
    </div>
  );
}
