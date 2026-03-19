"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"];

const CATEGORY_LABELS: Record<string, string> = {
  venue: "Venue",
  djs: "DJs",
  security: "Seguridad",
  marketing: "Marketing",
  staff: "Staff",
  production: "Produccion",
  other: "Otro",
};

type ExpensesByCategoryChartProps = {
  data: { category: string; total: number }[];
};

export function ExpensesByCategoryChart({ data }: ExpensesByCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">
        Sin gastos registrados
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    value: d.total / 100,
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
