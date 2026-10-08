import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { createWorkflow } from "@/app/actions/workflows";

export default async function DashboardPage() {
  const user = await requireUser();
  const [keys, workflows, runs, tokens] = await Promise.all([
    prisma.apiKey.count({ where: { userId: user.id } }),
    prisma.workflow.count({ where: { userId: user.id } }),
    prisma.workflowRun.count({ where: { userId: user.id } }),
    prisma.workflowRun.aggregate({ where: { userId: user.id }, _sum: { tokens: true } }),
  ]);

  const stats = [
    { label: "API keys", value: keys },
    { label: "Workflows", value: workflows },
    { label: "Runs", value: runs },
    { label: "Tokens used", value: tokens._sum.tokens ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <p className="text-muted">Your AI automations, powered by your own keys.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <div className="text-sm text-muted">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {keys === 0 ? (
        <div className="card">
          <h2 className="font-semibold">Step 1: add an API key</h2>
          <p className="mt-1 text-sm text-muted">Add an OpenAI, Anthropic or Google key to start running workflows.</p>
          <Link href="/settings" className="btn-primary mt-4">Add API key</Link>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-semibold">Build an automation</h2>
          <p className="mt-1 text-sm text-muted">Chain AI steps together: input → prompt → transform → output.</p>
          <form action={createWorkflow}>
            <button className="btn-primary mt-4">New workflow</button>
          </form>
        </div>
      )}
    </div>
  );
}
