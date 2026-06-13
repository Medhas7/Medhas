import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, RiskBadge } from "@/components/common";
import { listRuns } from "@/lib/store";
import { AgentStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<AgentStatus, "safe" | "medium" | "high" | "critical" | "default"> = {
  completed: "safe",
  approved: "safe",
  awaiting_approval: "medium",
  rejected: "high",
  failed: "critical",
};

export default async function AgentRuns() {
  const runs = await listRuns();

  if (runs.length === 0) {
    return <EmptyState title="No agent runs yet" hint="Every call to SARATHI is logged here." />;
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <Card key={run.id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{run.agent_name}</Badge>
              <Badge variant="outline">{run.detected_node}</Badge>
              <RiskBadge risk={run.risk_level} />
              <Badge variant={STATUS_VARIANT[run.status]} className="capitalize">
                {run.status.replace("_", " ")}
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">{formatDate(run.created_at)}</span>
            </div>

            <div className="rounded-lg bg-secondary/40 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Input</p>
              <p className="text-sm">{run.input}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Output</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{run.answer}</p>
            </div>

            {run.memories_used.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                Memories used:
                {run.memories_used.map((m) => (
                  <span key={m} className="rounded bg-secondary px-1.5 py-0.5">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
