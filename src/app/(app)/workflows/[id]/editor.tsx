"use client";

import "@xyflow/react/dist/style.css";
import {
  addEdge,
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { deleteWorkflow, saveWorkflow } from "@/app/actions/workflows";
import { ModelPicker, type KeyOption } from "@/components/model-picker";
import { FormMessage } from "@/components/form-message";
import { TRANSFORM_OPS, type NodeResult, type NodeType, type WorkflowGraph } from "@/lib/workflow/types";

type FlowNode = Node<Record<string, unknown>, NodeType>;

const NODE_META: Record<NodeType, { title: string; color: string; hint: string }> = {
  input: { title: "Input", color: "#0ea5e9", hint: "Text you provide when running" },
  ai: { title: "AI Prompt", color: "#6366f1", hint: "Calls a model with your key" },
  transform: { title: "Transform", color: "#f59e0b", hint: "Reshape text without AI" },
  output: { title: "Output", color: "#16a34a", hint: "Final result of the run" },
};

function FlowCard({ type, data, selected }: NodeProps<FlowNode>) {
  const meta = NODE_META[type as NodeType];
  return (
    <div
      className="min-w-44 rounded-lg border bg-card px-3 py-2 text-left shadow-sm"
      style={{ borderColor: selected ? meta.color : "var(--border)", borderLeft: `4px solid ${meta.color}` }}
    >
      {type !== "input" && <Handle type="target" position={Position.Top} />}
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: meta.color }}>{meta.title}</div>
      <div className="text-sm font-medium">{String(data.label ?? meta.title)}</div>
      {type === "ai" && <div className="text-xs text-muted">{String(data.model || "no model")}</div>}
      {type !== "output" && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

const nodeTypes = { input: FlowCard, ai: FlowCard, transform: FlowCard, output: FlowCard };

const DEFAULT_DATA: Record<NodeType, Record<string, unknown>> = {
  input: { label: "Input" },
  ai: { label: "AI step", apiKeyId: "", model: "", system: "", prompt: "{{previous}}" },
  transform: { label: "Transform", op: "trim", template: "{{previous}}" },
  output: { label: "Output" },
};

type Run = { id: string; status: string; output: string | null; error: string | null; tokens: number; nodeResults: NodeResult[] | null };

export function WorkflowEditor({
  id,
  initialName,
  initialDescription,
  initialGraph,
  keys,
}: {
  id: string;
  initialName: string;
  initialDescription: string;
  initialGraph: WorkflowGraph;
  keys: KeyOption[];
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialGraph.nodes as FlowNode[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialGraph.edges);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [saving, startSave] = useTransition();

  const [runInput, setRunInput] = useState("");
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<Run | null>(null);

  const selected = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, id: `e-${c.source}-${c.target}-${Date.now()}` }, eds)),
    [setEdges],
  );

  function addNode(type: NodeType) {
    const id = `${type}-${Date.now().toString(36)}`;
    const y = Math.max(0, ...nodes.map((n) => n.position.y)) + 140;
    setNodes((ns) => [...ns, { id, type, position: { x: 0, y }, data: { ...DEFAULT_DATA[type] } }]);
    setSelectedId(id);
  }

  function updateSelected(patch: Record<string, unknown>) {
    setNodes((ns) => ns.map((n) => (n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n)));
  }

  function removeSelected() {
    setNodes((ns) => ns.filter((n) => n.id !== selectedId));
    setEdges((es) => es.filter((e) => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
  }

  function toGraph(): WorkflowGraph {
    return {
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })) as WorkflowGraph["nodes"],
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    };
  }

  async function save() {
    const res = await saveWorkflow(id, { name, description, graph: toGraph() });
    setStatus(res.error ? { error: res.error } : { success: "Saved" });
    return !res.error;
  }

  async function runWorkflow() {
    setRunning(true);
    setRun(null);
    setStatus({});
    try {
      if (!(await save())) return;
      const res = await fetch(`/api/workflows/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: runInput }),
      });
      const json = await res.json();
      if (!res.ok) setStatus({ error: json.error ?? "Run failed" });
      else setRun(json.run);
    } catch {
      setStatus({ error: "Network error while running" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/workflows" className="text-sm text-muted hover:text-foreground">← Workflows</Link>
        <input className="input max-w-xs font-semibold" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="ml-auto flex gap-2">
          <button className="btn-outline" disabled={saving} onClick={() => startSave(async () => void (await save()))}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button className="btn-danger" onClick={() => confirm("Delete this workflow and its runs?") && deleteWorkflow(id)}>
            Delete
          </button>
        </div>
      </div>
      <input
        className="input"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <FormMessage error={status.error} success={status.success} />
      {keys.length === 0 && (
        <p className="text-sm text-danger">
          You have no API keys yet — <Link href="/settings" className="underline">add one</Link> before running AI steps.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(NODE_META) as NodeType[]).map((t) => (
              <button key={t} className="btn-outline py-1 text-xs" onClick={() => addNode(t)} title={NODE_META[t].hint}>
                + {NODE_META[t].title}
              </button>
            ))}
          </div>
          <div className="h-[520px] rounded-xl border border-border bg-card">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, n) => setSelectedId(n.id)}
              onPaneClick={() => setSelectedId(null)}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
          <p className="text-xs text-muted">
            Drag from a node&apos;s bottom handle to another node to connect. Select an edge and press Backspace to remove it.
            In prompts, use <code>{"{{input}}"}</code> for the run input and <code>{"{{previous}}"}</code> for the connected step&apos;s output.
          </p>
        </div>

        <aside className="space-y-4">
          <div className="card space-y-3 p-4">
            {selected ? (
              <NodeConfig node={selected} keys={keys} onChange={updateSelected} onDelete={removeSelected} />
            ) : (
              <p className="text-sm text-muted">Select a node to configure it.</p>
            )}
          </div>

          <div className="card space-y-3 p-4">
            <h3 className="font-semibold">Run</h3>
            <textarea
              className="input min-h-24"
              placeholder="Input text for this run…"
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
            />
            <button className="btn-primary w-full" disabled={running} onClick={runWorkflow}>
              {running ? "Running…" : "Save & run"}
            </button>
            {run && <RunResult run={run} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function NodeConfig({
  node,
  keys,
  onChange,
  onDelete,
}: {
  node: FlowNode;
  keys: KeyOption[];
  onChange: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const d = node.data as Record<string, string>;
  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{NODE_META[node.type as NodeType].title}</h3>
        <button className="text-xs text-danger hover:underline" onClick={onDelete}>Remove node</button>
      </div>
      <div>
        <label className="label">Label</label>
        <input className="input" value={d.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} />
      </div>
      {node.type === "ai" && (
        <>
          <ModelPicker keys={keys} apiKeyId={d.apiKeyId ?? ""} model={d.model ?? ""} onChange={onChange} />
          <div>
            <label className="label">System prompt</label>
            <textarea className="input min-h-16" value={d.system ?? ""} onChange={(e) => onChange({ system: e.target.value })} />
          </div>
          <div>
            <label className="label">Prompt</label>
            <textarea className="input min-h-28" value={d.prompt ?? ""} onChange={(e) => onChange({ prompt: e.target.value })} />
          </div>
        </>
      )}
      {node.type === "transform" && (
        <>
          <div>
            <label className="label">Operation</label>
            <select className="input" value={d.op ?? "trim"} onChange={(e) => onChange({ op: e.target.value })}>
              {TRANSFORM_OPS.map((op) => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>
          {d.op === "template" && (
            <div>
              <label className="label">Template</label>
              <textarea className="input min-h-24" value={d.template ?? ""} onChange={(e) => onChange({ template: e.target.value })} />
            </div>
          )}
        </>
      )}
    </>
  );
}

export function RunResult({ run }: { run: Run }) {
  return (
    <div className="space-y-2 text-sm">
      <div className={run.status === "success" ? "text-success" : "text-danger"}>
        {run.status === "success" ? "Success" : "Failed"} · {run.tokens} tokens ·{" "}
        <Link href={`/runs/${run.id}`} className="underline">details</Link>
      </div>
      {run.error && <p className="text-danger">{run.error}</p>}
      {run.output && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background p-3">{run.output}</pre>}
    </div>
  );
}
