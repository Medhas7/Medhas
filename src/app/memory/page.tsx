"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common";
import { LIFE_AREAS, MEMORY_TYPES, Memory, MemoryType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Plus, Search, Trash2, X } from "lucide-react";

const EMPTY = {
  type: "artifact" as MemoryType,
  title: "",
  content: "",
  area: "" as string,
  importance: 5,
  confidence: 0.7,
  tags: "",
};

export default function MemoryVault() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/memories")
      .then((r) => r.json())
      .then((d) => setMemories(d.memories ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return memories.filter((m) => {
      const matchType = typeFilter === "all" || m.type === typeFilter;
      const matchQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));
      return matchType && matchQuery;
    });
  }, [memories, query, typeFilter]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        area: form.area || null,
        importance: Number(form.importance),
        confidence: Number(form.confidence),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    setMemories((m) => [data.memory, ...m]);
    setForm(EMPTY);
    setShowForm(false);
    setSaving(false);
  }

  async function remove(id: string) {
    setMemories((m) => m.filter((x) => x.id !== id));
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories…"
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-auto">
          <option value="all">All types</option>
          {MEMORY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Button onClick={() => setShowForm((s) => !s)} className="gap-1.5">
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Close" : "New memory"}
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardContent className="p-5">
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A short name for this memory" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="What SARATHI should remember…" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MemoryType })}>
                  {MEMORY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Life area</Label>
                <Select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                  <option value="">— none —</option>
                  {LIFE_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Importance · {form.importance}/10</Label>
                <input type="range" min={0} max={10} value={form.importance} onChange={(e) => setForm({ ...form, importance: Number(e.target.value) })} className="w-full accent-[hsl(var(--primary))]" />
              </div>
              <div className="space-y-1.5">
                <Label>Confidence · {Math.round(form.confidence * 100)}%</Label>
                <input type="range" min={0} max={1} step={0.05} value={form.confidence} onChange={(e) => setForm({ ...form, confidence: Number(e.target.value) })} className="w-full accent-[hsl(var(--primary))]" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vision, money, core" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save memory"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading memories…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No memories match" hint="Adjust your search or add a new memory." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((m) => (
            <Card key={m.id} className="group">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="capitalize">
                      {m.type}
                    </Badge>
                    {m.area && (
                      <Badge variant="outline" className="text-[10px]">
                        {m.area}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => remove(m.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Delete memory"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <h3 className="font-semibold leading-tight">{m.title}</h3>
                <p className="text-sm leading-snug text-muted-foreground">{m.content}</p>
                {m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((t) => (
                      <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>
                    Importance {m.importance}/10 · Confidence {Math.round(m.confidence * 100)}%
                  </span>
                  <span>{formatDate(m.updated_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
