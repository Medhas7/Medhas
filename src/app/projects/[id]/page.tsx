import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/common";
import { getProject, listTasks } from "@/lib/store";
import { TaskStatus } from "@/lib/types";
import { ArrowLeft, CheckCircle2, Circle, CircleDashed, CircleSlash } from "lucide-react";

export const dynamic = "force-dynamic";

const TASK_ICON: Record<TaskStatus, React.ReactNode> = {
  done: <CheckCircle2 className="size-4 text-primary" />,
  doing: <CircleDashed className="size-4 text-amber-400" />,
  todo: <Circle className="size-4 text-muted-foreground" />,
  blocked: <CircleSlash className="size-4 text-red-400" />,
};

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) notFound();
  const tasks = await listTasks({ projectId: project.id });

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All projects
      </Link>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{project.area}</Badge>
                <Badge variant="primary" className="capitalize">
                  {project.status}
                </Badge>
              </div>
            </div>
            <div className="w-40">
              <Meter label="Priority" value={project.priority} />
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">North star</p>
            <p className="mt-0.5 text-sm">{project.north_star}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet for this project.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
              >
                {TASK_ICON[task.status]}
                <div className="flex-1">
                  <p className="text-sm">{task.title}</p>
                  {task.notes && <p className="text-xs text-muted-foreground">{task.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {task.estimated_time && <span>{task.estimated_time}</span>}
                  <Badge variant="outline" className="text-[10px]">
                    P{task.priority}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
