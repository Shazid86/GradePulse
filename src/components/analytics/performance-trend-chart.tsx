"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerformancePoint } from "@/calculations/trend";

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 };

/** Performance over time: one point per dated, graded assessment (§16/§17). */
export function PerformanceTrendChart({ points }: { points: PerformancePoint[] }) {
  const data = points.map((p) => ({ ...p, day: p.date.slice(5) }));

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label="Assessment performance over time chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -14 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border/60"
          />
          <XAxis
            dataKey="day"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={34}
          />
          <Tooltip
            formatter={(value) => [`${Number(value)}%`, "Score"]}
            labelFormatter={(_label, payload) => {
              const p = payload?.[0]?.payload as
                | { title?: string; date?: string }
                | undefined;
              return p?.title ? `${p.title} · ${p.date}` : "";
            }}
          />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
