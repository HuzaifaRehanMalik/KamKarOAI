const styles: Record<string, string> = {
  success: "border-success/30 text-success",
  failed: "border-danger/30 text-danger",
  running: "border-primary/30 text-primary",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] ${styles[status] ?? "border-border text-muted"}`}
    >
      <span className={`size-1.5 rounded-full bg-current ${status === "running" ? "blink" : ""}`} />
      {status}
    </span>
  );
}
