import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/common";
import { listProjects, listTasks } from "@/lib/store";
import { ProjectStatus } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<ProjectStatus, "primary" | "default" | "outline"> = {
  active: "primary",
  shipped: "primary",
  idea: "outline",
  paused: "default",
  archived: "default",
};

export default async function Projects() {
  const [projects, tasks] = await Promise.all([listProjects(), listTasks()]);
  const taskCount = (id: string) => tasks.filter((t) => t.project_id === id);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => {
        const pTasks = taskCount(p.id);
        const open = pTasks.filter((t) => t.status !== "done").length;
        return (
          <Link key={p.id} href={`/projects/${p.id}`} className="group">
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {p.area}
                    </Badge>
                  </div>
                  <Badge variant={STATUS_VARIANT[p.status]} className="capitalize">
                    {p.status}
                  </Badge>
                </div>

                <p className="flex-1 text-sm leading-snug text-muted-foreground">{p.summary}</p>

                <p className="text-xs italic text-muted-foreground">★ {p.north_star}</p>

                <Meter label="Priority" value={p.priority} />

                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>
                    {open} open · {pTasks.length} tasks
                  </span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
