"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ModeBadge } from "@/components/mode-badge";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card/40">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <span className="font-serif text-lg font-bold">ॐ</span>
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">SARATHI OS</div>
          <div className="text-[11px] text-muted-foreground">Kuldeep&apos;s command center</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <ModeBadge />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          AI proposes. Kuldeep approves. Reality validates. Memory evolves.
        </p>
      </div>
    </aside>
  );
}
