import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meter, RiskBadge, SectionLabel } from "@/components/common";
import { listNodes } from "@/lib/store";
import { LifeNode } from "@/lib/types";
import { ROOT_MISSION } from "@/lib/seed";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<LifeNode["status"], string> = {
  seed: "text-sky-400",
  active: "text-emerald-400",
  thriving: "text-primary",
  dormant: "text-muted-foreground",
  blocked: "text-red-400",
};

function NodeCard({ node, child = false }: { node: LifeNode; child?: boolean }) {
  return (
    <Card className={child ? "border-border/60 bg-card/60" : ""}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold tracking-tight">{node.name}</h3>
              <Badge variant="outline" className="text-[10px]">
                {node.area}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{node.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Meter label="Priority" value={node.priority} />
          <Meter label="Impact" value={node.impact} />
          <Meter label="Energy" value={node.energy_cost} tone="muted" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs font-medium capitalize ${STATUS_TONE[node.status]}`}>
            ● {node.status}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Dharma risk</span>
            <RiskBadge risk={node.dharma_risk} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function NodeGraph() {
  const nodes = await listNodes();
  const roots = nodes.filter((n) => !n.parent_id);
  const childrenOf = (id: string) => nodes.filter((n) => n.parent_id === id);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Root mission</p>
          <p className="mt-1 font-serif text-lg text-balance">{ROOT_MISSION}</p>
        </CardContent>
      </Card>

      <div>
        <SectionLabel>The ten life areas</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roots.map((node) => {
            const kids = childrenOf(node.id);
            return (
              <div key={node.id} className="space-y-2">
                <NodeCard node={node} />
                {kids.map((kid) => (
                  <div key={kid.id} className="ml-4 border-l border-border pl-3">
                    <NodeCard node={kid} child />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
