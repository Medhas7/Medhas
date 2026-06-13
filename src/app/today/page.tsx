"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionLabel } from "@/components/common";
import { DAILY_RHYTHM } from "@/lib/seed";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Plus, Sunrise } from "lucide-react";

const RITUALS = [
  { key: "meditation", label: "Meditation", area: "Being" },
  { key: "body", label: "Body", area: "Body" },
  { key: "music", label: "Music", area: "Music" },
  { key: "medhas", label: "Medhas", area: "Medhas" },
  { key: "money", label: "Money", area: "Money" },
  { key: "review", label: "Review", area: "Mind" },
];

export default function TodayCockpit() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [rituals, setRituals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/tasks?today=1")
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks ?? []))
      .finally(() => setLoading(false));
  }, []);

  const top3 = tasks.slice(0, 3);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim(), is_today: true, priority: 6 }),
    });
    const data = await res.json();
    setTasks((t) => [data.task, ...t]);
    setNewTask("");
  }

  async function toggleTask(task: Task) {
    const status = task.status === "done" ? "todo" : "done";
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top 3 priorities */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Today&apos;s top 3 priorities</CardTitle>
            <Badge variant="outline">
              {done}/{tasks.length} done
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : top3.length === 0 ? (
              <EmptyState title="No priorities yet" hint="Add your first task below." />
            ) : (
              top3.map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-3 text-left transition-colors hover:border-primary/40"
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className={cn("flex-1 text-sm", task.status === "done" && "text-muted-foreground line-through")}>
                    {task.title}
                  </span>
                  {task.estimated_time && (
                    <span className="shrink-0 text-xs text-muted-foreground">{task.estimated_time}</span>
                  )}
                </button>
              ))
            )}

            <form onSubmit={addTask} className="flex gap-2 pt-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Quick add a task for today…"
              />
              <Button type="submit" size="icon" className="shrink-0">
                <Plus className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ritual checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Ritual checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {RITUALS.map((r) => {
              const checked = rituals[r.key];
              return (
                <button
                  key={r.key}
                  onClick={() => setRituals((s) => ({ ...s, [r.key]: !s[r.key] }))}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-secondary"
                >
                  {checked ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <span className={cn("flex-1", checked && "text-muted-foreground line-through")}>{r.label}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {r.area}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Routine blocks (daily rhythm) */}
      <div>
        <SectionLabel>Daily rhythm</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DAILY_RHYTHM.map((block) => (
            <Card key={block.window} className="overflow-hidden">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sunrise className="size-4" />
                  <span className="text-sm font-semibold tabular-nums">{block.window}</span>
                </div>
                <p className="text-sm leading-snug">{block.focus}</p>
                <Badge variant="outline" className="text-[10px]">
                  {block.area}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
