"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProgressionPoint } from "@/calculations/progression";

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 };

/**
 * Assessment progression: cumulative secured course marks over time (§16).
 * Ends at the engine's securedMarks when every completed item is dated.
 */
export function AssessmentProgressionChart({
  points,
  totalMarks,
}: {
  points: ProgressionPoint[];
  totalMarks: number;
}) {
  const data = points.map((p) => ({ ...p, day: p.date.slice(5) }));

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label="Assessment progression chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
            domain={[0, Math.max(1, totalMarks)]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value)} ${name === "cumulative" ? "marks secured" : name}`,
              name === "cumulative" ? "Total" : name,
            ]}
            labelFormatter={(_label, payload) => {
              const p = payload?.[0]?.payload as
                | { title?: string; date?: string; contribution?: number }
                | undefined;
              return p?.title
                ? `${p.title} · ${p.date} (+${p.contribution})`
                : "";
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="var(--color-chart-1)"
            fillOpacity={0.15}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
