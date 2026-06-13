"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Database, HardDrive } from "lucide-react";

/**
 * Surfaces whether SARATHI is running against a live Supabase backend or the
 * local seeded mock dataset. Reads /api/health, fails quiet to "mock".
 */
export function ModeBadge() {
  const [mode, setMode] = useState<"supabase" | "mock" | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => setMode("mock"));
  }, []);

  if (!mode) return null;

  return mode === "supabase" ? (
    <Badge variant="safe" className="gap-1">
      <Database className="size-3" /> Supabase
    </Badge>
  ) : (
    <Badge variant="medium" className="gap-1">
      <HardDrive className="size-3" /> Mock mode
    </Badge>
  );
}
