import { NonRetriableError } from "inngest";
import { prisma } from "@/lib/db";
import { runWithUserKey } from "@/lib/keys";
import { executeWorkflow } from "@/lib/workflow/engine";
import { graphSchema } from "@/lib/workflow/types";
import { inngest, workflowRunRequested } from "./client";

async function markFailed(runId: string, error: string) {
  await prisma.workflowRun.updateMany({
    where: { id: runId, status: "running" },
    data: { status: "failed", error, finishedAt: new Date() },
  });
}

export const executeWorkflowRun = inngest.createFunction(
  {
    id: "execute-workflow-run",
    triggers: [workflowRunRequested],
    // Retries cover infrastructure errors (DB, network). Node errors are recorded on the run, not thrown.
    retries: 2,
    onFailure: async ({ event, error }) => {
      const runId = (event.data.event.data as { runId?: string }).runId;
      if (runId) await markFailed(runId, error.message);
    },
  },
  async ({ event, step }) => {
    const { runId } = event.data;

    const result = await step.run("execute", async () => {
      const run = await prisma.workflowRun.findUnique({ where: { id: runId }, include: { workflow: true } });
      if (!run) throw new NonRetriableError(`Run ${runId} not found`);
      if (run.status !== "running") return { skipped: true as const };

      const graph = graphSchema.safeParse(run.workflow.graph);
      if (!graph.success) {
        await markFailed(runId, "Saved workflow is invalid");
        return { skipped: true as const };
      }

      let res: Awaited<ReturnType<typeof executeWorkflow>>;
      try {
        res = await executeWorkflow(graph.data, run.input, (args) => runWithUserKey(run.userId, args));
      } catch (err) {
        res = { ok: false, error: err instanceof Error ? err.message : String(err), results: [], tokens: 0 };
      }

      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: res.ok ? "success" : "failed",
          output: res.ok ? res.output : null,
          error: res.ok ? null : res.error,
          nodeResults: res.results,
          tokens: res.tokens,
          finishedAt: new Date(),
        },
      });
      return { skipped: false as const, ok: res.ok };
    });

    return result;
  },
);

export const functions = [executeWorkflowRun];
