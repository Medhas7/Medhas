"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/common";
import { AgentResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Brain, CornerDownLeft, Loader2, Sparkles } from "lucide-react";

interface ChatTurn {
  role: "user" | "sarathi";
  text: string;
  response?: AgentResponse;
  memories_used?: string[];
}

const SUGGESTIONS = [
  "What is the highest-leverage move on Medhas this week?",
  "Help me design the AI Nalanda knowledge field.",
  "How do I protect my 04:00 sadhana when work is heavy?",
  "Draft a plan to grow the Money Engine ethically.",
];

export default function CommandCenter() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(message: string) {
    const text = message.trim();
    if (!text || loading) return;
    setTurns((t) => [...t, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setTurns((t) => [
        ...t,
        {
          role: "sarathi",
          text: data.response.answer,
          response: data.response,
          memories_used: data.run?.memories_used ?? [],
        },
      ]);
    } catch {
      setTurns((t) => [
        ...t,
        { role: "sarathi", text: "I could not reach the agent. Check the server and try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }));
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      {/* Conversation */}
      <Card className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin md:p-6">
          {turns.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Speak with SARATHI</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground text-balance">
                Your command center for life mastery. Ask anything across Being, Medhas, Money,
                Music, Knowledge, and Relationships. SARATHI proposes — you approve.
              </p>
              <div className="mt-6 grid w-full max-w-md gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((turn, i) => (
            <div key={i} className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed md:max-w-[80%]",
                  turn.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-secondary/40",
                )}
              >
                {turn.role === "sarathi" && turn.response && (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="primary" className="gap-1">
                      <Sparkles className="size-3" /> {turn.response.agent_name}
                    </Badge>
                    <Badge variant="outline">{turn.response.detected_node}</Badge>
                    <RiskBadge risk={turn.response.risk_level} />
                  </div>
                )}
                <p className="whitespace-pre-wrap">{turn.text}</p>

                {turn.response && turn.response.suggested_actions.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Suggested actions
                    </p>
                    {turn.response.suggested_actions.map((a, j) => (
                      <div key={j} className="flex items-center justify-between gap-2 text-xs">
                        <span>{a.title}</span>
                        <span className="shrink-0 text-muted-foreground">
                          P{a.priority} · {a.estimated_time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {turn.response?.requires_approval && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    Requires your explicit approval before SARATHI acts.
                  </div>
                )}

                {turn.memories_used && turn.memories_used.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <Brain className="size-3" /> Memories used:
                    {turn.memories_used.map((m) => (
                      <span key={m} className="rounded bg-secondary px-1.5 py-0.5">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> SARATHI is reasoning…
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3 md:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask SARATHI… (Enter to send, Shift+Enter for newline)"
              className="min-h-[44px] max-h-40 flex-1 resize-none"
              rows={1}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-11 w-11 shrink-0">
              <CornerDownLeft className="size-4" />
            </Button>
          </form>
        </div>
      </Card>

      {/* Context rail */}
      <div className="hidden space-y-4 lg:block">
        <Card>
          <CardContent className="space-y-3 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              The core law
            </p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li>AI proposes.</li>
              <li>Kuldeep approves.</li>
              <li>Reality validates.</li>
              <li>Memory evolves.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Specialist agents
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Core Sarathi",
                "Life Architect",
                "Medhas Builder",
                "Knowledge Librarian",
                "Money Operator",
                "Creative Director",
                "Relationship Steward",
                "Researcher",
                "Code Builder",
              ].map((a) => (
                <Badge key={a} variant="outline" className="text-[11px]">
                  {a}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
