import { z } from "zod";

export const TRANSFORM_OPS = ["trim", "uppercase", "lowercase", "extractJson", "template"] as const;

const position = z.object({ x: z.number(), y: z.number() });

export const nodeSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string(), type: z.literal("input"), position, data: z.object({ label: z.string().optional() }) }),
  z.object({
    id: z.string(),
    type: z.literal("ai"),
    position,
    data: z.object({
      label: z.string().optional(),
      apiKeyId: z.string().default(""),
      model: z.string().default(""),
      system: z.string().default(""),
      prompt: z.string().default("{{previous}}"),
    }),
  }),
  z.object({
    id: z.string(),
    type: z.literal("transform"),
    position,
    data: z.object({
      label: z.string().optional(),
      op: z.enum(TRANSFORM_OPS).default("trim"),
      template: z.string().default("{{previous}}"),
    }),
  }),
  z.object({ id: z.string(), type: z.literal("output"), position, data: z.object({ label: z.string().optional() }) }),
]);

export const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const graphSchema = z.object({
  nodes: z.array(nodeSchema).max(50),
  edges: z.array(edgeSchema).max(200),
});

export type WorkflowNode = z.infer<typeof nodeSchema>;
export type WorkflowEdge = z.infer<typeof edgeSchema>;
export type WorkflowGraph = z.infer<typeof graphSchema>;
export type NodeType = WorkflowNode["type"];

export type NodeResult = {
  nodeId: string;
  type: NodeType;
  label?: string;
  output: string;
  tokens?: number;
  error?: string;
  ms: number;
};

export const DEFAULT_GRAPH: WorkflowGraph = {
  nodes: [
    { id: "input", type: "input", position: { x: 0, y: 0 }, data: { label: "Input" } },
    {
      id: "ai-1",
      type: "ai",
      position: { x: 0, y: 140 },
      data: { label: "Summarize", apiKeyId: "", model: "", system: "", prompt: "Summarize this:\n\n{{previous}}" },
    },
    { id: "output", type: "output", position: { x: 0, y: 300 }, data: { label: "Output" } },
  ],
  edges: [
    { id: "e1", source: "input", target: "ai-1" },
    { id: "e2", source: "ai-1", target: "output" },
  ],
};
