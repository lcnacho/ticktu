"use client";

import { useEffect } from "react";
import { CircleCheck, CircleX } from "lucide-react";

type ScanResult = {
  valid: boolean;
  holderName?: string;
  ticketType?: string;
  reason?: string;
};

type ScanResultOverlayProps = {
  result: ScanResult;
  onDismiss: () => void;
};

export function ScanResultOverlay({ result, onDismiss }: ScanResultOverlayProps) {
  useEffect(() => {
    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(result.valid ? [100] : [200, 50, 200]);
    }

    // Auto-dismiss after 2 seconds
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [result, onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${
        result.valid ? "bg-green-500" : "bg-red-500"
      }`}
      onClick={onDismiss}
      role="alert"
      aria-live="assertive"
    >
      {result.valid ? (
        <>
          <CircleCheck className="mb-4 size-24 text-white" strokeWidth={1.5} />
          <p className="text-3xl font-bold text-white">VALIDO</p>
          {result.holderName && (
            <p className="mt-2 text-lg text-white/90">{result.holderName}</p>
          )}
          {result.ticketType && (
            <p className="mt-1 text-white/70">{result.ticketType}</p>
          )}
        </>
      ) : (
        <>
          <CircleX className="mb-4 size-24 text-white" strokeWidth={1.5} />
          <p className="text-3xl font-bold text-white">INVALIDO</p>
          {result.reason && (
            <p className="mt-2 text-lg text-white/90">{result.reason}</p>
          )}
        </>
      )}
    </div>
  );
}
