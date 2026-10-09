import Link from "next/link";
import { getSession } from "@/lib/session";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { FlowDiagram } from "@/components/landing/flow-diagram";
import { Magnetic, Reveal, Stagger, StaggerItem, WordReveal } from "@/components/landing/motion-primitives";

const steps = [
  {
    n: "01",
    title: "Bring your own key",
    body: "Paste an OpenAI, Anthropic or Google key. It is encrypted at rest and only ever used for your runs. No markup, no middleman billing.",
  },
  {
    n: "02",
    title: "Wire the steps",
    body: "Drop input, prompt, transform and output nodes on a canvas. Connect them, pick a model per step, and reference earlier results with {{previous}}.",
  },
  {
    n: "03",
    title: "Run and inspect",
    body: "Execute the whole chain in one click. Every step records its output, latency and token count so you can see exactly where the work happened.",
  },
];

const providers = ["OpenAI", "Anthropic", "Google Gemini"];

export default async function Home() {
  const session = await getSession();
  const primary = session ? { href: "/dashboard", label: "Open dashboard" } : { href: "/signup", label: "Start building" };

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" />
      <div className="glow pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Logo />
        <nav className="flex items-center gap-6 text-sm">
          <a href="#how" className="hidden text-muted transition hover:text-foreground sm:inline">How it works</a>
          {session ? (
            <Link href="/dashboard" className="btn-outline py-2">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-muted transition hover:text-foreground">Log in</Link>
              <Link href="/signup" className="btn-outline py-2">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 pb-28 pt-14 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:pb-36 lg:pt-24">
        <Stagger delay={0.05}>
          <StaggerItem as="p" className="eyebrow flex items-center gap-2">
            <span className="blink inline-block size-1.5 rounded-full bg-primary" /> Your keys · your models
          </StaggerItem>
          <StaggerItem as="h1" className="mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
            AI workflows that
            <br />
            run on <span className="text-primary">your keys.</span>
          </StaggerItem>
          <StaggerItem as="p" className="mt-7 max-w-md text-lg leading-relaxed text-muted">
            Chain prompts, transforms and models into one automation. Pay your provider directly, with nothing in between.
          </StaggerItem>
          <StaggerItem className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href={primary.href} className="btn-primary group px-6 py-3 text-[15px]">
                {primary.label} <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </Magnetic>
            <a href="#how" className="btn-outline px-6 py-3 text-[15px]">See how it works</a>
          </StaggerItem>
        </Stagger>

        <FlowDiagram />
      </section>

      {/* Providers strip */}
      <section className="relative z-10 border-y border-border bg-card/40">
        <Stagger onView gap={0.08} className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-8 lg:px-10">
          <StaggerItem as="span" className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Works with</StaggerItem>
          {providers.map((p) => (
            <StaggerItem as="span" key={p} className="font-display text-xl font-medium tracking-tight text-foreground/70 transition-colors hover:text-foreground">{p}</StaggerItem>
          ))}
          <StaggerItem as="span" className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Any model they ship</StaggerItem>
        </Stagger>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              From key to
              <br />
              automation in
              <br />
              three moves.
            </h2>
          </Reveal>
          <Stagger as="ol" onView gap={0.15} className="divide-y divide-border border-y border-border">
            {steps.map((s) => (
              <StaggerItem as="li" key={s.n} className="group grid gap-4 py-10 sm:grid-cols-[88px_1fr]">
                <span className="font-mono text-sm text-primary/80 transition group-hover:text-primary">{s.n}</span>
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-tight">{s.title}</h3>
                  <p className="mt-3 max-w-lg leading-relaxed text-muted">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-border">
        <div className="glow pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 py-28 lg:flex-row lg:items-end lg:justify-between lg:px-10">
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            <WordReveal text="Build your first chain in under five minutes." />
          </h2>
          <Reveal delay={0.3}>
            <Magnetic>
              <Link href={primary.href} className="btn-primary group px-7 py-3.5 text-[15px]">
                {primary.label} <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
