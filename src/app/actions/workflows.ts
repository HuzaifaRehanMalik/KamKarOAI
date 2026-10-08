"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DEFAULT_GRAPH, graphSchema, type WorkflowGraph } from "@/lib/workflow/types";

export async function createWorkflow() {
  const user = await requireUser();
  const wf = await prisma.workflow.create({
    data: { userId: user.id, name: "Untitled workflow", graph: DEFAULT_GRAPH },
  });
  redirect(`/workflows/${wf.id}`);
}

export async function saveWorkflow(id: string, data: { name: string; description: string; graph: WorkflowGraph }) {
  const user = await requireUser();
  const graph = graphSchema.safeParse(data.graph);
  if (!graph.success) return { error: "Workflow graph is invalid" };
  const name = data.name.trim().slice(0, 100) || "Untitled workflow";

  const { count } = await prisma.workflow.updateMany({
    where: { id, userId: user.id },
    data: { name, description: data.description.slice(0, 500), graph: graph.data },
  });
  if (!count) return { error: "Workflow not found" };
  revalidatePath("/workflows");
  return { ok: true };
}

export async function deleteWorkflow(id: string) {
  const user = await requireUser();
  await prisma.workflow.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/workflows");
  redirect("/workflows");
}
