import { eventType, Inngest } from "inngest";
import { z } from "zod";

export const inngest = new Inngest({ id: "kamkaroai" });

export const workflowRunRequested = eventType("workflow/run.requested", {
  schema: z.object({ runId: z.string() }),
});
