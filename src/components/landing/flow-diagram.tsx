"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "./motion-primitives";

const nodes = [
  { tag: "Input", title: "Customer email", color: "var(--accent)" },
  { tag: "AI", title: "Classify intent", color: "var(--primary)" },
  { tag: "Transform", title: "Extract fields", color: "var(--warning)" },
  { tag: "Output", title: "Routed ticket", color: "var(--success)" },
];

/* Decorative preview of a workflow chain with a signal pulse running through it. */
export function FlowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(-1);

  // Light the steps up one after another, like a run walking the chain.
  useEffect(() => {
    if (reduce || !inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % (nodes.length + 1)), 700);
    return () => clearInterval(id);
  }, [inView, reduce]);

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto w-full max-w-md"
      initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: EASE_OUT }}
    >
      <div className="brackets rounded-lg border border-border bg-card/70 p-8 backdrop-blur-sm">
        <div className="mb-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          <span>support-triage</span>
          <span className="flex items-center gap-2 text-success">
            <span className="blink size-1.5 rounded-full bg-success" /> running
          </span>
        </div>
        <div className="relative">
          <svg className="absolute left-6 top-0 h-full w-px overflow-visible" aria-hidden>
            <line x1="0" y1="24" x2="0" y2="100%" stroke="var(--border-strong)" strokeWidth="1" />
            <line x1="0" y1="24" x2="0" y2="100%" stroke="var(--primary)" strokeWidth="2" className="signal-path" />
          </svg>
          <motion.ul
            className="relative space-y-6"
            initial={reduce ? false : "hidden"}
            animate="shown"
            transition={{ staggerChildren: 0.12, delayChildren: 0.45 }}
          >
            {nodes.map((n, i) => {
              const lit = i === active;
              return (
                <motion.li
                  key={n.title}
                  className="flex items-center gap-5"
                  variants={{ hidden: { opacity: 0, x: 20 }, shown: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.6, ease: EASE_OUT }}
                >
                  <span
                    className="relative z-10 grid size-12 shrink-0 place-items-center rounded-md border bg-background transition-shadow duration-300"
                    style={{ borderColor: n.color, boxShadow: lit ? `0 0 18px -2px ${n.color}` : "none" }}
                  >
                    <motion.span
                      className="size-2 rounded-full"
                      style={{ background: n.color, boxShadow: `0 0 12px 1px ${n.color}` }}
                      animate={{ scale: lit ? 1.6 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    />
                  </span>
                  <div
                    className="flex-1 rounded-md border bg-background/60 px-4 py-3 transition-colors duration-300"
                    style={{ borderColor: lit ? n.color : "var(--border)" }}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: n.color }}>{n.tag}</div>
                    <div className="mt-0.5 text-[15px] font-medium">{n.title}</div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
        <div className="mt-8 flex justify-between border-t border-border pt-5 font-mono text-xs text-muted">
          <span>4 steps</span>
          <span>1.8s</span>
          <span>612 tokens</span>
        </div>
      </div>
    </motion.div>
  );
}
