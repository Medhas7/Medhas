import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const label = risk.charAt(0).toUpperCase() + risk.slice(1);
  return <Badge variant={risk}>{label}</Badge>;
}

/** A thin labeled meter for 0–10 scores (priority, impact, energy). */
export function Meter({
  label,
  value,
  max = 10,
  tone = "primary",
}: {
  label: string;
  value: number;
  max?: number;
  tone?: "primary" | "muted" | "danger";
}) {
  const pct = Math.round((value / max) * 100);
  const bar =
    tone === "danger" ? "bg-destructive" : tone === "muted" ? "bg-muted-foreground" : "bg-primary";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="uppercase tracking-wide">{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}
