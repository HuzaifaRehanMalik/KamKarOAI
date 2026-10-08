import type { NodeResult, WorkflowGraph, WorkflowNode } from "./types";

export type AiRunner = (args: {
  apiKeyId: string;
  model: string;
  system: string;
  prompt: string;
}) => Promise<{ text: string; tokens: number }>;

/** Kahn's algorithm. Throws on cycles or edges pointing at unknown nodes. */
export function topoSort(graph: WorkflowGraph): WorkflowNode[] {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const indegree = new Map(graph.nodes.map((n) => [n.id, 0]));
  for (const e of graph.edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) throw new Error(`Edge ${e.id} references a missing node`);
    indegree.set(e.target, indegree.get(e.target)! + 1);
  }
  const queue = graph.nodes.filter((n) => indegree.get(n.id) === 0).map((n) => n.id);
  const order: WorkflowNode[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(byId.get(id)!);
    for (const e of graph.edges) {
      if (e.source !== id) continue;
      indegree.set(e.target, indegree.get(e.target)! - 1);
      if (indegree.get(e.target) === 0) queue.push(e.target);
    }
  }
  if (order.length !== graph.nodes.length) throw new Error("Workflow contains a cycle");
  return order;
}

export function renderTemplate(template: string, vars: { input: string; previous: string }) {
  return template.replace(/\{\{\s*(input|previous)\s*\}\}/g, (_, name: "input" | "previous") => vars[name]);
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text.slice(Math.max(0, text.search(/[[{]/)));
  try {
    return JSON.stringify(JSON.parse(candidate.trim()), null, 2);
  } catch {
    throw new Error("No valid JSON found in input");
  }
}

export async function executeWorkflow(graph: WorkflowGraph, input: string, runAi: AiRunner) {
  if (!graph.nodes.some((n) => n.type === "input")) throw new Error("Workflow needs an Input node");
  if (!graph.nodes.some((n) => n.type === "output")) throw new Error("Workflow needs an Output node");

  const order = topoSort(graph);
  const outputs = new Map<string, string>();
  const results: NodeResult[] = [];
  let tokens = 0;

  for (const node of order) {
    const started = Date.now();
    const previous = graph.edges
      .filter((e) => e.target === node.id)
      .map((e) => outputs.get(e.source) ?? "")
      .join("\n\n");
    const vars = { input, previous };

    try {
      let output: string;
      let nodeTokens: number | undefined;
      switch (node.type) {
        case "input":
          output = input;
          break;
        case "ai": {
          if (!node.data.apiKeyId) throw new Error("No API key selected");
          if (!node.data.model) throw new Error("No model selected");
          const res = await runAi({
            apiKeyId: node.data.apiKeyId,
            model: node.data.model,
            system: renderTemplate(node.data.system, vars),
            prompt: renderTemplate(node.data.prompt, vars),
          });
          output = res.text;
          nodeTokens = res.tokens;
          tokens += res.tokens;
          break;
        }
        case "transform":
          switch (node.data.op) {
            case "trim": output = previous.trim(); break;
            case "uppercase": output = previous.toUpperCase(); break;
            case "lowercase": output = previous.toLowerCase(); break;
            case "extractJson": output = extractJson(previous); break;
            case "template": output = renderTemplate(node.data.template, vars); break;
          }
          break;
        case "output":
          output = previous;
          break;
      }
      outputs.set(node.id, output);
      results.push({ nodeId: node.id, type: node.type, label: node.data.label, output, tokens: nodeTokens, ms: Date.now() - started });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ nodeId: node.id, type: node.type, label: node.data.label, output: "", error: message, ms: Date.now() - started });
      return { ok: false as const, error: `${node.data.label ?? node.id}: ${message}`, results, tokens };
    }
  }

  const finalOutput = graph.nodes
    .filter((n) => n.type === "output")
    .map((n) => outputs.get(n.id) ?? "")
    .join("\n\n");
  return { ok: true as const, output: finalOutput, results, tokens };
}
