const styles: Record<string, string> = {
  success: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger",
  running: "bg-primary/10 text-primary",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}>{status}</span>;
}
