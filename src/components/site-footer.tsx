import Link from "next/link";
import { CREDITS, hostOf } from "./credits";
import { Logo } from "./logo";

const productLinks = [
  { href: "/#how", label: "How it works" },
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Create account" },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr_1.6fr] lg:px-10">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Multi-step AI workflows on OpenAI, Anthropic and Google, billed to your own keys, never ours.
          </p>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_1px_var(--primary)]" />
            Keys encrypted · AES-256-GCM
          </p>
        </div>

        <nav className="space-y-4">
          <p className="eyebrow">Product</p>
          <ul className="space-y-2.5 text-sm">
            {productLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition hover:text-foreground">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <p className="eyebrow">Built by</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CREDITS.map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_10px_40px_-12px_rgba(57,255,90,0.35)]"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{c.label}</p>
                <p className="mt-1.5 flex items-center justify-between font-display text-lg font-semibold tracking-tight">
                  {c.name}
                  <span aria-hidden className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary">↗</span>
                </p>
                <p className="mt-1 truncate font-mono text-xs text-muted group-hover:text-primary/80">{hostOf(c.url)}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5 font-mono text-xs text-muted lg:px-10">
          <span>© {new Date().getFullYear()} KamKarOAI · A product of HRM Solution</span>
          <span>Made by Huzaifa Rehan</span>
        </div>
      </div>
    </footer>
  );
}
