"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Bottom tab bar for mobile. Mirrors the sidebar's primary destinations. */
export function MobileNav() {
  const pathname = usePathname();
  // The eight destinations don't fit a phone bar comfortably; show the six core.
  const items = NAV_ITEMS.filter((i) => !["/runs", "/settings"].includes(i.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card/95 backdrop-blur md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {item.short}
          </Link>
        );
      })}
    </nav>
  );
}
