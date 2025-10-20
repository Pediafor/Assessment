"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type Item = { label: string; href: Route; icon?: React.ElementType; exact?: boolean; badgeCount?: number };

export function Sidebar({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:block sticky top-16 h-[calc(100vh-64px)] pr-6 border-r">
      <nav className="py-6 flex flex-col gap-1 text-sm">
        {items.map((it) => {
          const active = it.exact
            ? pathname === it.href
            : pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "rounded-md px-3 py-2 hover:bg-card transition-colors flex items-center gap-2 " +
                (active ? "bg-card font-medium" : "text-muted")
              }
            >
              {it.icon ? <it.icon size={16} /> : null}
              <span className="flex-1 flex items-center justify-between">
                <span>{it.label}</span>
                {typeof it.badgeCount === 'number' && it.badgeCount > 0 ? (
                  <span className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 text-[11px] px-1">
                    {it.badgeCount > 99 ? '99+' : it.badgeCount}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
