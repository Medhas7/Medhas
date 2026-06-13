"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { ModeBadge } from "@/components/mode-badge";

export function Topbar() {
  const pathname = usePathname();
  const current =
    NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(i.href + "/")) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary md:hidden">
          <span className="font-serif text-base font-bold">ॐ</span>
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight md:text-lg">{current.label}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{current.description}</p>
        </div>
      </div>
      <div className="md:hidden">
        <ModeBadge />
      </div>
    </header>
  );
}
