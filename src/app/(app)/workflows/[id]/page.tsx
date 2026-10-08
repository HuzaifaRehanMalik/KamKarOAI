import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { DEFAULT_GRAPH, graphSchema } from "@/lib/workflow/types";
import { WorkflowEditor } from "./editor";

export default async function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [workflow, keys] = await Promise.all([
    prisma.workflow.findFirst({ where: { id, userId: user.id } }),
    prisma.apiKey.findMany({
      where: { userId: user.id },
      select: { id: true, provider: true, label: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!workflow) notFound();

  const parsed = graphSchema.safeParse(workflow.graph);
  return (
    <WorkflowEditor
      id={workflow.id}
      initialName={workflow.name}
      initialDescription={workflow.description ?? ""}
      initialGraph={parsed.success ? parsed.data : DEFAULT_GRAPH}
      keys={keys}
    />
  );
}
