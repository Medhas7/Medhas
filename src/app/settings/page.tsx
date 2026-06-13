"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, KeyRound, Lock, ShieldCheck } from "lucide-react";

const PERMISSION_RULES = [
  { level: "Safe", tone: "safe" as const, rule: "Safe actions can be automatic." },
  { level: "Medium", tone: "medium" as const, rule: "Medium-risk actions need confirmation." },
  { level: "High", tone: "high" as const, rule: "High-risk actions need explicit approval." },
  { level: "Critical", tone: "critical" as const, rule: "Critical actions must never be autonomous." },
];

const NEVER_AUTONOMOUS = [
  "Send emails",
  "Spend money",
  "Publish content",
  "Delete files",
  "Make legal decisions",
  "Make medical decisions",
  "Make financial decisions",
  "Contact people",
  "Change important records",
];

export default function Settings() {
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="space-y-4">
      {/* Privacy warning */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex gap-3 p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-200">Privacy warning</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-200/80">
              SARATHI OS is a private instrument for one founder-user. Memories, reviews, and decisions
              are deeply personal. Keys entered here are placeholders only — never commit secrets to the
              repository, and store live keys in environment variables. When a model provider is wired,
              your messages and memory context will be sent to that provider; review their data policy first.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Model provider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" /> Model provider
            </CardTitle>
            <CardDescription>Placeholders for v2 agent wiring. Not yet active.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Gemini</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>API key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-… (stored in env vars in production)"
              />
              <p className="text-[11px] text-muted-foreground">
                For real use, set <code className="rounded bg-secondary px-1">{providerEnv(provider)}</code> in your environment.
              </p>
            </div>
            <Badge variant="medium" className="gap-1">
              <Lock className="size-3" /> Local engine active — provider not yet connected
            </Badge>
          </CardContent>
        </Card>

        {/* Permission rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Permission rules
            </CardTitle>
            <CardDescription>The governing law: AI proposes, Kuldeep approves.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {PERMISSION_RULES.map((r) => (
              <div key={r.level} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                <Badge variant={r.tone}>{r.level}</Badge>
                <span className="text-sm text-muted-foreground">{r.rule}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Never autonomous */}
      <Card>
        <CardHeader>
          <CardTitle>Never autonomous</CardTitle>
          <CardDescription>
            SARATHI will draft and propose these, but will never execute them without explicit approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {NEVER_AUTONOMOUS.map((item) => (
              <Badge key={item} variant="outline" className="border-destructive/30 text-destructive">
                {item}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function providerEnv(provider: string): string {
  switch (provider) {
    case "openai":
      return "OPENAI_API_KEY";
    case "gemini":
      return "GEMINI_API_KEY";
    default:
      return "ANTHROPIC_API_KEY";
  }
}
