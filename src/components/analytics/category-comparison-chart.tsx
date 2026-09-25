"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryScore } from "@/calculations/score";

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 };

/**
 * Category comparison: graded categories side by side (§16/§19).
 * Ungraded categories are excluded — only real stored results appear.
 */
export function CategoryComparisonChart({
  categories,
}: {
  categories: CategoryScore[];
}) {
  const data = categories
    .filter((c) => c.percentage !== null)
    .map((c) => ({ name: c.name, percentage: c.percentage as number }));

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label="Category comparison chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: 4 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: unknown) => {
              const s = String(v);
              return s.length > 12 ? `${s.slice(0, 11)}…` : s;
            }}
          />
          <Tooltip formatter={(value) => [`${Number(value)}%`, "Score"]} />
          <Bar
            dataKey="percentage"
            fill="var(--color-chart-1)"
            radius={[0, 4, 4, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
