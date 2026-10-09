"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workflows", label: "Workflows" },
  { href: "/runs", label: "Runs" },
  { href: "/playground", label: "Playground" },
  { href: "/settings", label: "Settings" },
];

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const all = isAdmin ? [...links, { href: "/admin", label: "Admin" }] : links;
  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto text-sm">
      {all.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`relative whitespace-nowrap px-3 py-4 transition ${
              active ? "text-foreground" : "text-muted hover:text-foreground"
            } ${l.href === "/admin" && !active ? "text-primary/80" : ""}`}
          >
            {l.label}
            {active && (
              <span className="absolute inset-x-3 bottom-0 h-px bg-primary shadow-[0_0_10px_1px_rgba(57,255,90,0.7)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
