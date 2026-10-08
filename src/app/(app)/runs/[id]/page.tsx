import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { StatusBadge } from "@/components/status-badge";
import type { NodeResult } from "@/lib/workflow/types";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const run = await prisma.workflowRun.findFirst({
    where: { id, userId: user.id },
    include: { workflow: { select: { id: true, name: true } } },
  });
  if (!run) notFound();
  const results = (run.nodeResults ?? []) as NodeResult[];

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/workflows/${run.workflow.id}`} className="text-sm text-muted hover:text-foreground">← {run.workflow.name}</Link>
        <h1 className="mt-1 flex items-center gap-3 text-2xl font-semibold">Run <StatusBadge status={run.status} /></h1>
        <p className="text-sm text-muted">{run.startedAt.toLocaleString()} · {run.tokens} tokens</p>
      </div>
      {run.error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{run.error}</p>}

      <section className="card space-y-2">
        <h2 className="font-semibold">Input</h2>
        <pre className="whitespace-pre-wrap text-sm">{run.input || <span className="text-muted">(empty)</span>}</pre>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Steps</h2>
        {results.map((r, i) => (
          <div key={r.nodeId} className="card space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{i + 1}. {r.label ?? r.nodeId}</span>
              <span className="text-muted">{r.type} · {r.ms} ms{r.tokens ? ` · ${r.tokens} tokens` : ""}</span>
            </div>
            {r.error ? (
              <p className="text-sm text-danger">{r.error}</p>
            ) : (
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm">{r.output}</pre>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
