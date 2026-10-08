import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { StatusBadge } from "@/components/status-badge";

export default async function RunsPage() {
  const user = await requireUser();
  const runs = await prisma.workflowRun.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 100,
    select: { id: true, status: true, tokens: true, startedAt: true, workflow: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Run history</h1>
      {runs.length === 0 ? (
        <p className="card text-muted">No runs yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr><th className="p-3">Workflow</th><th className="p-3">Status</th><th className="p-3">Tokens</th><th className="p-3">Started</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((r) => (
                <tr key={r.id}>
                  <td className="p-3"><Link href={`/runs/${r.id}`} className="text-primary hover:underline">{r.workflow.name}</Link></td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3">{r.tokens}</td>
                  <td className="p-3 text-muted">{r.startedAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
