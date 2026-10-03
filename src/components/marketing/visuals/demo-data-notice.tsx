import { cn } from "@/lib/utils";

import { DEMO_NOTICE } from "./demo-data";

/**
 * Honest labelling for every illustrative figure on the public site (§Rule 5:
 * no fake data in the product, and demo data must be marked as such).
 */
export function DemoDataNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-xs leading-relaxed text-muted-foreground/80",
        className
      )}
    >
      {DEMO_NOTICE}
    </p>
  );
}