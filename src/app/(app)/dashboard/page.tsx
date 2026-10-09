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
    <div className="space-y-12">
      <div>
        <p className="eyebrow">Overview</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Welcome, {user.name}</h1>
        <p className="mt-3 text-muted">Your AI automations, powered by your own keys.</p>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{s.label}</div>
            <div className="mt-4 font-display text-4xl font-medium tracking-tight tabular-nums">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {keys === 0 ? (
        <NextStep
          step="Step 01"
          title="Add an API key"
          body="Add an OpenAI, Anthropic or Google key to start running workflows."
          action={<Link href="/settings" className="btn-primary">Add API key →</Link>}
        />
      ) : (
        <NextStep
          step="Next"
          title="Build an automation"
          body="Chain AI steps together: input → prompt → transform → output."
          action={
            <form action={createWorkflow}>
              <button className="btn-primary">New workflow →</button>
            </form>
          }
        />
      )}
    </div>
  );
}

function NextStep({ step, title, body, action }: { step: string; title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="brackets relative overflow-hidden rounded-lg border border-border bg-card p-8 sm:p-10">
      <div className="glow pointer-events-none absolute -right-20 -top-32 h-80 w-80" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{step}</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-muted">{body}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
