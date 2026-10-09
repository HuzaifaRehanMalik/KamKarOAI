"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from "motion/react";
import { useRef } from "react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children in once they scroll into view. */
export function Reveal({ delay = 0, y = 24, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      {...props}
    />
  );
}

/** Headline that rises in word by word when it enters the viewport. */
export function WordReveal({ text, className = "", accent }: { text: string; className?: string; accent?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: 0.06 }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={`inline-block ${accent && w.replace(/[.,]/g, "") === accent ? "text-primary" : ""}`}
            variants={{ hidden: { y: "105%" }, shown: { y: 0 } }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            {w}
            {i < words.length - 1 && "\u00a0"}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Pulls its child slightly toward the cursor. Pointer only, static under reduced motion. */
export function Magnetic({ children, strength = 0.25 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div ref={ref} className="inline-flex" style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

/** Staggers its StaggerItem children in, on mount (`onView` false) or when scrolled into view. */
export function Stagger({
  onView = false,
  gap = 0.09,
  delay = 0,
  as = "div",
  ...props
}: HTMLMotionProps<"div"> & { onView?: boolean; gap?: number; delay?: number; as?: "div" | "ol" }) {
  const reduce = useReducedMotion();
  const Comp = (as === "ol" ? motion.ol : motion.div) as typeof motion.div;
  const trigger = onView ? { whileInView: "shown", viewport: { once: true, amount: 0.2 } } : { animate: "shown" };
  return (
    <Comp
      initial={reduce ? false : "hidden"}
      {...trigger}
      transition={{ staggerChildren: gap, delayChildren: delay }}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}

export function StaggerItem({ as = "div", ...props }: HTMLMotionProps<"div"> & { as?: "div" | "li" | "span" | "p" | "h1" }) {
  const Comp = motion[as] as typeof motion.div;
  return <Comp variants={staggerItem} {...props} />;
}
