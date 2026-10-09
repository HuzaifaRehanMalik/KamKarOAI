import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { inngest, workflowRunRequested } from "@/lib/inngest/client";
import { graphSchema } from "@/lib/workflow/types";

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

  // Execution happens in the background (src/lib/inngest/functions.ts); the client polls GET /api/runs/[id].
  try {
    await inngest.send(workflowRunRequested.create({ runId: run.id }));
  } catch (err) {
    const failed = await prisma.workflowRun.update({
      where: { id: run.id },
      data: { status: "failed", error: "Could not queue run: " + (err instanceof Error ? err.message : String(err)), finishedAt: new Date() },
    });
    return NextResponse.json({ run: failed }, { status: 503 });
  }

  return NextResponse.json({ run }, { status: 202 });
}
