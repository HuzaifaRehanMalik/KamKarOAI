import { prisma } from "@/lib/db";
import { isAdmin, requireAdmin } from "@/lib/session";
import { StatusBadge } from "@/components/status-badge";
import { UserActions } from "./user-actions";
import { LiveRefresh } from "./live-refresh";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

type Activity = { at: Date; kind: "signup" | "workflow" | "run"; text: string; status?: string };

function timeAgo(date: Date) {
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function nodeCount(graph: unknown) {
  const nodes = (graph as { nodes?: unknown[] } | null)?.nodes;
  return Array.isArray(nodes) ? nodes.length : 0;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; wq?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const wq = params.wq?.trim() ?? "";
  const since24h = new Date(Date.now() - DAY);
  const since7d = new Date(Date.now() - 7 * DAY);

  const [
    userCount, verifiedCount, newUsers7d, activeUsers24h,
    workflowCount, newWorkflows7d, runCount, runs24h, failed24h, tokens,
    users, workflows, recentRuns, latestSignups, latestWorkflows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.user.count({
      where: { OR: [{ sessions: { some: { updatedAt: { gte: since24h } } } }, { runs: { some: { startedAt: { gte: since24h } } } }] },
    }),
    prisma.workflow.count(),
    prisma.workflow.count({ where: { createdAt: { gte: since7d } } }),
    prisma.workflowRun.count(),
    prisma.workflowRun.count({ where: { startedAt: { gte: since24h } } }),
    prisma.workflowRun.count({ where: { startedAt: { gte: since24h }, status: "failed" } }),
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
    prisma.workflow.findMany({
      where: wq
        ? { OR: [{ name: { contains: wq, mode: "insensitive" } }, { user: { email: { contains: wq, mode: "insensitive" } } }] }
        : undefined,
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true, name: true, graph: true, createdAt: true, updatedAt: true,
        user: { select: { email: true } },
        _count: { select: { runs: true } },
        runs: { orderBy: { startedAt: "desc" }, take: 1, select: { status: true, startedAt: true } },
      },
    }),
    prisma.workflowRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      select: { id: true, status: true, error: true, tokens: true, startedAt: true, user: { select: { email: true } }, workflow: { select: { name: true } } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { email: true, createdAt: true } }),
    prisma.workflow.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { name: true, createdAt: true, user: { select: { email: true } } } }),
  ]);

  const failedByWorkflow = new Map(
    (
      await prisma.workflowRun.groupBy({
        by: ["workflowId"],
        where: { workflowId: { in: workflows.map((w) => w.id) }, status: "failed" },
        _count: true,
      })
    ).map((g) => [g.workflowId, g._count]),
  );

  const activity: Activity[] = [
    ...latestSignups.map((u) => ({ at: u.createdAt, kind: "signup" as const, text: `${u.email} signed up` })),
    ...latestWorkflows.map((w) => ({ at: w.createdAt, kind: "workflow" as const, text: `${w.user.email} created “${w.name}”` })),
    ...recentRuns.slice(0, 10).map((r) => ({
      at: r.startedAt, kind: "run" as const, status: r.status, text: `${r.user.email} ran “${r.workflow.name}”`,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 15);

  const stats = [
    { label: "Total users", value: userCount },
    { label: "Verified users", value: verifiedCount },
    { label: "New users (7d)", value: newUsers7d },
    { label: "Active users (24h)", value: activeUsers24h },
    { label: "Workflows", value: workflowCount },
    { label: "New workflows (7d)", value: newWorkflows7d },
    { label: "Total runs", value: runCount },
    { label: "Runs (24h)", value: runs24h },
    { label: "Failed (24h)", value: failed24h, danger: failed24h > 0 },
    { label: "Tokens (all time)", value: tokens._sum.tokens ?? 0 },
  ];

  const kindLabel: Record<Activity["kind"], string> = { signup: "New user", workflow: "Workflow", run: "Run" };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin panel</h1>
        <LiveRefresh />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-xs text-muted">{s.label}</div>
            <div className={`mt-1 text-xl font-semibold ${s.danger ? "text-danger" : ""}`}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Latest activity</h2>
        <div className="rounded-xl border border-border bg-card">
          {activity.length === 0 ? (
            <p className="p-4 text-sm text-muted">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {activity.map((a, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 p-3">
                  <span className="w-20 shrink-0 text-xs font-medium text-muted">{kindLabel[a.kind]}</span>
                  <span className="min-w-0 flex-1 truncate">{a.text}</span>
                  {a.status && <StatusBadge status={a.status} />}
                  <span className="text-xs text-muted" title={a.at.toLocaleString()}>{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">All workflows</h2>
          <form className="flex gap-2">
            {q && <input type="hidden" name="q" value={q} />}
            <input className="input" name="wq" defaultValue={wq} placeholder="Search name or owner email" />
            <button className="btn-outline">Search</button>
          </form>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="p-3">Workflow</th><th className="p-3">Owner</th><th className="p-3">Steps</th>
                <th className="p-3">Runs</th><th className="p-3">Failed</th><th className="p-3">Last run</th><th className="p-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workflows.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-muted">No workflows yet.</td></tr>
              )}
              {workflows.map((w) => {
                const last = w.runs[0];
                const failed = failedByWorkflow.get(w.id) ?? 0;
                return (
                  <tr key={w.id}>
                    <td className="p-3 font-medium">{w.name}</td>
                    <td className="p-3 text-muted">{w.user.email}</td>
                    <td className="p-3">{nodeCount(w.graph)}</td>
                    <td className="p-3">{w._count.runs}</td>
                    <td className={`p-3 ${failed ? "text-danger" : ""}`}>{failed}</td>
                    <td className="p-3">
                      {last ? (
                        <span className="flex items-center gap-2">
                          <StatusBadge status={last.status} />
                          <span className="text-xs text-muted">{timeAgo(last.startedAt)}</span>
                        </span>
                      ) : (
                        <span className="text-muted">never</span>
                      )}
                    </td>
                    <td className="p-3 text-muted" title={w.updatedAt.toLocaleString()}>{timeAgo(w.updatedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Users</h2>
          <form className="flex gap-2">
            {wq && <input type="hidden" name="wq" value={wq} />}
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
                  <td className="p-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-muted">{u.email}{!u.emailVerified && " · unverified"}</div>
                  </td>
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
