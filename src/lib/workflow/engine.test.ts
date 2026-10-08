import assert from "node:assert/strict";
import { test } from "node:test";
import { executeWorkflow, renderTemplate, topoSort } from "./engine";
import type { WorkflowGraph } from "./types";

const pos = { x: 0, y: 0 };

const graph: WorkflowGraph = {
  nodes: [
    { id: "in", type: "input", position: pos, data: {} },
    { id: "ai", type: "ai", position: pos, data: { apiKeyId: "k1", model: "m", system: "", prompt: "Summarize: {{previous}}" } },
    { id: "t", type: "transform", position: pos, data: { op: "uppercase", template: "" } },
    { id: "out", type: "output", position: pos, data: {} },
  ],
  edges: [
    { id: "1", source: "in", target: "ai" },
    { id: "2", source: "ai", target: "t" },
    { id: "3", source: "t", target: "out" },
  ],
};

test("renderTemplate substitutes known variables only", () => {
  assert.equal(renderTemplate("{{ input }} / {{previous}} / {{other}}", { input: "a", previous: "b" }), "a / b / {{other}}");
});

test("topoSort orders nodes and rejects cycles", () => {
  assert.deepEqual(topoSort(graph).map((n) => n.id), ["in", "ai", "t", "out"]);
  assert.throws(() => topoSort({ ...graph, edges: [...graph.edges, { id: "4", source: "out", target: "in" }] }), /cycle/);
});

test("executeWorkflow chains steps and sums tokens", async () => {
  const calls: string[] = [];
  const res = await executeWorkflow(graph, "hello", async ({ prompt }) => {
    calls.push(prompt);
    return { text: "short summary", tokens: 7 };
  });
  assert.equal(calls[0], "Summarize: hello");
  assert.ok(res.ok);
  assert.equal(res.output, "SHORT SUMMARY");
  assert.equal(res.tokens, 7);
  assert.equal(res.results.length, 4);
});

test("executeWorkflow stops at the failing node", async () => {
  const res = await executeWorkflow(graph, "hello", async () => {
    throw new Error("invalid api key");
  });
  assert.equal(res.ok, false);
  assert.match(res.ok ? "" : res.error, /invalid api key/);
  assert.equal(res.results.at(-1)?.nodeId, "ai");
});

test("extractJson transform pulls JSON out of a fenced block", async () => {
  const g: WorkflowGraph = {
    nodes: [
      { id: "in", type: "input", position: pos, data: {} },
      { id: "t", type: "transform", position: pos, data: { op: "extractJson", template: "" } },
      { id: "out", type: "output", position: pos, data: {} },
    ],
    edges: [{ id: "1", source: "in", target: "t" }, { id: "2", source: "t", target: "out" }],
  };
  const res = await executeWorkflow(g, 'Here:\n```json\n{"a":1}\n```', async () => ({ text: "", tokens: 0 }));
  assert.ok(res.ok);
  assert.deepEqual(JSON.parse(res.output), { a: 1 });
});
