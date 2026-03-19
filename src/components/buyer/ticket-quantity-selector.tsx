"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

type TicketQuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  disabled?: boolean;
};

export function TicketQuantitySelector({
  value,
  onChange,
  max,
  min = 0,
  disabled = false,
}: TicketQuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        <Minus className="size-4" />
      </Button>
      <span className="w-8 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
