"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { NodeType } from "@/lib/workflow/types";

export type FlowNode = Node<Record<string, unknown>, NodeType>;

export const NODE_META: Record<NodeType, { title: string; color: string; hint: string }> = {
  input: { title: "Input", color: "#5ee6ff", hint: "Text you provide when running" },
  ai: { title: "AI Prompt", color: "#39ff5a", hint: "Calls a model with your key" },
  transform: { title: "Transform", color: "#ffb547", hint: "Reshape text without AI" },
  output: { title: "Output", color: "#3dffa8", hint: "Final result of the run" },
};

export function FlowCard({ type, data, selected }: NodeProps<FlowNode>) {
  const meta = NODE_META[type as NodeType];
  const active = Boolean(data.active);
  return (
    <div
      className="min-w-48 rounded-md border bg-elevated px-3.5 py-2.5 text-left shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)] transition-[border-color,box-shadow] duration-300"
      style={{
        borderColor: selected || active ? meta.color : "var(--border)",
        borderLeft: `4px solid ${meta.color}`,
        boxShadow: active ? `0 0 0 1px ${meta.color}55, 0 12px 40px -12px ${meta.color}99` : undefined,
      }}
    >
      {type !== "input" && <Handle type="target" position={Position.Top} />}
      <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: meta.color }}>{meta.title}</div>
      <div className="text-sm font-medium">{String(data.label ?? meta.title)}</div>
      {type === "ai" && <div className="text-xs text-muted">{String(data.model || "no model")}</div>}
      {type !== "output" && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

export const nodeTypes = { input: FlowCard, ai: FlowCard, transform: FlowCard, output: FlowCard };
