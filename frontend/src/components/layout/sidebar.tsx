"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type Item = { label: string; href: Route; icon?: React.ElementType; exact?: boolean };

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
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
