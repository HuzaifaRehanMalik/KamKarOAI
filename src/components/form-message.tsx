export function FormMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>;
  if (success) return <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{success}</p>;
  return null;
}
