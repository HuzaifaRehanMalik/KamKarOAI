export const CREDITS = [
  { label: "A product of", name: "HRM Solution", url: "https://hrmsolution.vercel.app/" },
  { label: "Made by", name: "Huzaifa Rehan", url: "https://huzaifa-rehan-portfolio.vercel.app/" },
] as const;

export function hostOf(url: string) {
  return new URL(url).host;
}

/** Compact one-line credit for app and auth chrome. */
export function Credits({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted ${className}`}>
      {CREDITS.map((c, i) => (
        <span key={c.name} className="inline-flex items-center gap-3">
          {i > 0 && <span aria-hidden className="size-1 rounded-full bg-primary/60" />}
          <span>
            {c.label}{" "}
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/c inline-flex items-center gap-0.5 text-foreground underline decoration-primary/0 underline-offset-4 transition hover:text-primary hover:decoration-primary/60"
            >
              {c.name}
              <span aria-hidden className="text-[10px] opacity-50 transition group-hover/c:-translate-y-px group-hover/c:translate-x-px group-hover/c:opacity-100">↗</span>
            </a>
          </span>
        </span>
      ))}
    </span>
  );
}
