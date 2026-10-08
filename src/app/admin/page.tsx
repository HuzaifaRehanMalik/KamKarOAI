import { prisma } from "@/lib/db";
import { isAdmin, requireAdmin } from "@/lib/session";
import { StatusBadge } from "@/components/status-badge";
import { UserActions } from "./user-actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = (await searchParams).q?.trim() ?? "";
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [userCount, workflowCount, runCount, runs24h, failed24h, tokens, users, recentRuns] = await Promise.all([
    prisma.user.count(),
    prisma.workflow.count(),
    prisma.workflowRun.count(),
    prisma.workflowRun.count({ where: { startedAt: { gte: since } } }),
    prisma.workflowRun.count({ where: { startedAt: { gte: since }, status: "failed" } }),
    prisma.workflowRun.aggregate({ _sum: { tokens: true } }),
    prisma.user.findMany({
      where: q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }] } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, name: true, email: true, emailVerified: true, disabled: true, createdAt: true,
        _count: { select: { workflows: true, runs: true, apiKeys: true } },
      },
    }),
    prisma.workflowRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      select: { id: true, status: true, error: true, tokens: true, startedAt: true, user: { select: { email: true } }, workflow: { select: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Workflows", value: workflowCount },
    { label: "Total runs", value: runCount },
    { label: "Runs (24h)", value: runs24h },
    { label: "Failed (24h)", value: failed24h },
    { label: "Tokens (all time)", value: tokens._sum.tokens ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Admin panel</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xs text-muted">{s.label}</div>
            <div className="mt-1 text-xl font-semibold">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Users</h2>
          <form className="flex gap-2">
            <input className="input" name="q" defaultValue={q} placeholder="Search name or email" />
            <button className="btn-outline">Search</button>
          </form>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="p-3">User</th><th className="p-3">Keys</th><th className="p-3">Workflows</th>
                <th className="p-3">Runs</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3"><div className="font-medium">{u.name}</div><div className="text-muted">{u.email}</div></td>
                  <td className="p-3">{u._count.apiKeys}</td>
                  <td className="p-3">{u._count.workflows}</td>
                  <td className="p-3">{u._count.runs}</td>
                  <td className="p-3 text-muted">{u.createdAt.toLocaleDateString()}</td>
                  <td className="p-3">
                    {isAdmin(u) ? (
                      <span className="text-primary">admin</span>
                    ) : u.disabled ? (
                      <span className="text-danger">disabled</span>
                    ) : (
                      <span className="text-success">active</span>
                    )}
                  </td>
                  <td className="p-3">{!isAdmin(u) && <UserActions id={u.id} email={u.email} disabled={u.disabled} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent runs</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr><th className="p-3">User</th><th className="p-3">Workflow</th><th className="p-3">Status</th><th className="p-3">Tokens</th><th className="p-3">Error</th><th className="p-3">Started</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRuns.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">{r.user.email}</td>
                  <td className="p-3">{r.workflow.name}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3">{r.tokens}</td>
                  <td className="max-w-xs truncate p-3 text-danger" title={r.error ?? ""}>{r.error}</td>
                  <td className="p-3 text-muted">{r.startedAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
