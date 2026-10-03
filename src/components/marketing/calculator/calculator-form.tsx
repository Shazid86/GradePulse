"use client";

import { useMemo, useState } from "react";

import { analyzeTarget } from "@/calculations/requirements";
import { formatMarks, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

type Field = "obtained" | "total" | "target";

const DEFAULTS: Record<Field, string> = {
  obtained: "60",
  total: "100",
  target: "85",
};

const FIELDS = [
  { field: "obtained", label: "Marks obtained", hint: "so far" },
  { field: "total", label: "Course total", hint: "full marks" },
  { field: "target", label: "Target", hint: "%" },
] as const;

/**
 * The public required-score calculator.
 *
 * Deliberately backed by the SAME engine the application uses
 * (`@/calculations/requirements`) — the marketing page cannot drift from the
 * product, because it is not a reimplementation. Nothing here talks to
 * Supabase; it is pure arithmetic on what the visitor types.
 *
 * Assumption stated in the UI: every remaining mark is still obtainable, so
 * `maxPossibleScore` equals the course total.
 */
export function CalculatorForm() {
  const [values, setValues] = useState<Record<Field, string>>(DEFAULTS);

  const parsed = useMemo(() => {
    const obtained = Number(values.obtained);
    const total = Number(values.total);
    const target = Number(values.target);

    if (!values.obtained.trim() || !values.total.trim() || !values.target.trim())
      return { error: "Fill in all three fields." };
    if (![obtained, total, target].every(Number.isFinite))
      return { error: "Use numbers only." };
    if (total <= 0) return { error: "Total marks must be greater than 0." };
    if (obtained < 0 || obtained > total)
      return {
        error: `Marks obtained must be between 0 and ${formatMarks(total)}.`,
      };
    if (target < 0 || target > 100)
      return { error: "Target must be between 0% and 100%." };

    return {
      obtained,
      total,
      analysis: analyzeTarget({
        securedMarks: obtained,
        maxPossibleScore: total,
        totalMarks: total,
        targetPercentage: target,
      }),
    };
  }, [values]);

  const set = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        {FIELDS.map(({ field, label, hint }) => (
          <div key={field} className="space-y-1.5">
            <label
              htmlFor={`calc-${field}`}
              className="flex items-baseline justify-between gap-2 text-sm font-medium"
            >
              {label}
              <span className="text-xs font-normal text-muted-foreground">
                {hint}
              </span>
            </label>
            <input
              id={`calc-${field}`}
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={values[field]}
              onChange={set(field)}
              className="gp-figure h-11 w-full rounded-lg border border-border bg-background/60 px-3 text-base outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        ))}
        <p className="text-xs leading-relaxed text-muted-foreground">
          Assumes every remaining mark is still obtainable. No account needed,
          and nothing you type is stored or sent anywhere.
        </p>
      </form>

      <div aria-live="polite" className="gp-glass rounded-2xl p-5">
        {"error" in parsed ? (
          <p className="text-sm text-destructive">{parsed.error}</p>
        ) : (
          <div className="space-y-4">
            <dl className="space-y-2">
              {[
                {
                  label: "Current score",
                  value: `${formatMarks(parsed.obtained)} / ${formatMarks(parsed.total)}`,
                },
                {
                  label: "Remaining marks",
                  value: formatMarks(parsed.analysis.remainingMarks),
                },
                {
                  label: "Target",
                  value: `${formatMarks(parsed.analysis.targetMarks)} marks`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0 last:pb-0"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="gp-figure text-sm font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div
              className={cn(
                "rounded-xl border p-4",
                parsed.analysis.status === "impossible"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-primary/25 bg-primary/5"
              )}
            >
              {parsed.analysis.status === "achieved" ? (
                <>
                  <p className="text-sm font-medium text-primary">
                    Target already secured
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You are{" "}
                    {formatMarks(parsed.obtained - parsed.analysis.targetMarks)}{" "}
                    marks above the target. No further marks are required.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Required from the remaining marks
                  </p>
                  <p className="gp-figure mt-1 text-3xl font-semibold leading-none text-primary">
                    {formatMarks(parsed.analysis.requiredMarks)}
                    <span className="text-muted-foreground">
                      {" "}
                      / {formatMarks(parsed.analysis.remainingMarks)}
                    </span>
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                    That is
                  </p>
                  <p className="gp-figure mt-1 text-2xl font-semibold leading-none text-primary">
                    {formatPercent(parsed.analysis.requiredRemainingPercentage)}
                  </p>
                  <p className="gp-figure mt-2 text-xs text-muted-foreground">
                    {formatMarks(parsed.analysis.requiredMarks)} ÷{" "}
                    {formatMarks(parsed.analysis.remainingMarks)} ={" "}
                    {formatPercent(parsed.analysis.requiredRemainingPercentage)}
                  </p>
                  {parsed.analysis.status === "impossible" ? (
                    <p className="mt-3 text-xs leading-relaxed text-destructive">
                      Out of reach: even a perfect finish (
                      {formatMarks(parsed.total)} marks) stays below the target of{" "}
                      {formatMarks(parsed.analysis.targetMarks)} marks.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}