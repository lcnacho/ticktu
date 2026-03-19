"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type SalesChartProps = {
  data: { date: string; count: number; revenue: number }[];
};

export function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">
        Sin datos de ventas en el periodo
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            fontSize={12}
            stroke="#9ca3af"
          />
          <YAxis fontSize={12} stroke="#9ca3af" />
          <Tooltip
            labelFormatter={(v) =>
              new Date(String(v)).toLocaleDateString("es", {
                day: "numeric",
                month: "short",
              })
            }
            formatter={(value, name) => [
              value,
              name === "count" ? "Ventas" : "Ingresos",
            ]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.1}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
