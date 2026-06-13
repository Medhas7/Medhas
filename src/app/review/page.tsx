"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DailyReview, REVIEW_DIMENSIONS, ReviewDimension } from "@/lib/types";
import { cn, today } from "@/lib/utils";
import { Check } from "lucide-react";

const DIMENSION_LABEL: Record<ReviewDimension, string> = {
  atma: "Atma",
  body: "Body",
  mind: "Mind",
  work: "Work",
  creativity: "Creativity",
  money: "Money",
  love: "Love",
  dharma: "Dharma",
};

const SCORE_LABEL = ["Missed", "Partial", "Won"];

export default function DailyReviewPage() {
  const [scores, setScores] = useState<Record<ReviewDimension, number>>(() =>
    Object.fromEntries(REVIEW_DIMENSIONS.map((d) => [d, 1])) as Record<ReviewDimension, number>,
  );
  const [notes, setNotes] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [history, setHistory] = useState<DailyReview[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setHistory(d.reviews ?? []));
  }
  useEffect(load, []);

  const total = REVIEW_DIMENSIONS.reduce((acc, d) => acc + scores[d], 0);
  const maxTotal = REVIEW_DIMENSIONS.length * 2;

  async function save() {
    setSaving(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scores, review_date: today(), notes, next_focus: nextFocus }),
    });
    const data = await res.json();
    setHistory((h) => [data.review, ...h]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Score the day</CardTitle>
          <Badge variant="primary" className="text-sm tabular-nums">
            {total} / {maxTotal}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {REVIEW_DIMENSIONS.map((d) => (
            <div key={d} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="normal-case text-foreground">{DIMENSION_LABEL[d]}</Label>
                <span className="text-xs text-muted-foreground">{SCORE_LABEL[scores[d]]}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((v) => (
                  <button
                    key={v}
                    onClick={() => setScores((s) => ({ ...s, [d]: v }))}
                    className={cn(
                      "rounded-lg border py-2 text-sm font-medium transition-colors",
                      scores[d] === v
                        ? v === 0
                          ? "border-red-500/40 bg-red-500/15 text-red-300"
                          : v === 1
                            ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-1.5 pt-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened today? What did reality teach?" />
          </div>
          <div className="space-y-1.5">
            <Label>Next day focus</Label>
            <Textarea value={nextFocus} onChange={(e) => setNextFocus(e.target.value)} placeholder="The one or two things that matter most tomorrow." className="min-h-[60px]" />
          </div>

          <Button onClick={save} disabled={saving} className="w-full gap-1.5">
            {saved ? <Check className="size-4" /> : null}
            {saving ? "Saving…" : saved ? "Saved" : "Save review"}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent reviews</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          history.map((r) => {
            const sum = REVIEW_DIMENSIONS.reduce((acc, d) => acc + (r[d] as number), 0);
            return (
              <Card key={r.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{r.review_date}</span>
                    <Badge variant="outline" className="tabular-nums">
                      {sum}/{maxTotal}
                    </Badge>
                  </div>
                  {r.notes && <p className="text-xs leading-snug text-muted-foreground">{r.notes}</p>}
                  {r.next_focus && (
                    <p className="text-xs leading-snug">
                      <span className="text-primary">Next:</span> {r.next_focus}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
