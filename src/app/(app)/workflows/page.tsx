import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createWorkflow } from "@/app/actions/workflows";

export default async function WorkflowsPage() {
  const user = await requireUser();
  const workflows = await prisma.workflow.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, description: true, updatedAt: true, _count: { select: { runs: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <form action={createWorkflow}>
          <button className="btn-primary">New workflow</button>
        </form>
      </div>
      {workflows.length === 0 ? (
        <p className="card text-muted">No workflows yet. Create your first one to start automating.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((w) => (
            <Link key={w.id} href={`/workflows/${w.id}`} className="card block hover:border-primary">
              <div className="font-semibold">{w.name}</div>
              {w.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{w.description}</p>}
              <div className="mt-3 text-xs text-muted">
                {w._count.runs} runs · updated {w.updatedAt.toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
