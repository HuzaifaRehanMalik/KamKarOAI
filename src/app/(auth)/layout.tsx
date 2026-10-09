import { Credits } from "@/components/credits";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden border-r border-border lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid pointer-events-none absolute inset-0" />
        <div className="glow pointer-events-none absolute -bottom-40 -left-20 h-[520px] w-[520px]" />
        <Logo className="relative" />
        <div className="relative">
          <p className="eyebrow">Bring your own key</p>
          <h2 className="mt-5 max-w-md font-display text-5xl font-semibold leading-[1.02] tracking-[-0.035em]">
            Every model.
            <br />
            One <span className="text-primary">canvas.</span>
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-muted">
            Chain OpenAI, Anthropic and Google models into workflows that bill straight to your own account.
          </p>
        </div>
        <div className="relative flex flex-col gap-2">
          <span className="font-mono text-xs text-muted">Keys encrypted at rest · AES-256-GCM</span>
          <Credits />
        </div>
      </aside>

      <section className="flex flex-col items-center justify-center px-6 py-12">
        <Logo className="mb-10 lg:hidden" />
        <div className="rise w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}
