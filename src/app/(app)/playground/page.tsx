import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Playground } from "./playground";

export default async function PlaygroundPage() {
  const user = await requireUser();
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, provider: true, label: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.025em]">Playground</h1>
        <p className="text-muted">Send a single prompt to any model with one of your keys.</p>
      </div>
      {keys.length === 0 ? (
        <p className="card">No API keys yet. <Link href="/settings" className="text-primary hover:underline">Add one in settings</Link>.</p>
      ) : (
        <Playground keys={keys} />
      )}
    </div>
  );
}
