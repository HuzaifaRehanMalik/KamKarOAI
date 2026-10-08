import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { runWithUserKey } from "@/lib/keys";
import { executeWorkflow } from "@/lib/workflow/engine";
import { graphSchema } from "@/lib/workflow/types";

export const maxDuration = 300;

const bodySchema = z.object({ input: z.string().max(100_000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.disabled) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { id } = await params;

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const workflow = await prisma.workflow.findFirst({ where: { id, userId } });
  if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

  const graph = graphSchema.safeParse(workflow.graph);
  if (!graph.success) return NextResponse.json({ error: "Saved workflow is invalid" }, { status: 400 });

  const run = await prisma.workflowRun.create({
    data: { workflowId: id, userId, input: body.data.input },
  });

  let result: Awaited<ReturnType<typeof executeWorkflow>>;
  try {
    result = await executeWorkflow(graph.data, body.data.input, (args) => runWithUserKey(userId, args));
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : String(err), results: [], tokens: 0 };
  }

  const updated = await prisma.workflowRun.update({
    where: { id: run.id },
    data: {
      status: result.ok ? "success" : "failed",
      output: result.ok ? result.output : null,
      error: result.ok ? null : result.error,
      nodeResults: result.results,
      tokens: result.tokens,
      finishedAt: new Date(),
    },
  });

  return NextResponse.json({ run: updated });
}
