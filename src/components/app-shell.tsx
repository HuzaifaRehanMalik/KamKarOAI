import { Credits } from "./credits";
import { Logo } from "./logo";
import { LogoutButton } from "./logout-button";
import { NavLinks } from "./nav-links";
import { VerifyEmailBanner } from "./verify-email-banner";

export function AppShell({
  user,
  isAdmin,
  children,
}: {
  user: { name: string; email: string; emailVerified: boolean };
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-60" />
      <header className="sticky top-0 z-20 border-b border-border bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-6 lg:px-10">
          <Logo href="/dashboard" className="shrink-0 py-3" />
          <NavLinks isAdmin={isAdmin} />
          <div className="ml-auto flex shrink-0 items-center gap-5">
            <span className="hidden items-center gap-2 font-mono text-xs text-muted md:flex">
              <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_1px_var(--success)]" />
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="relative mx-auto max-w-7xl space-y-8 px-6 py-12 lg:px-10">
        {!user.emailVerified && <VerifyEmailBanner email={user.email} />}
        <div className="rise">{children}</div>
      </main>
      <footer className="relative border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5 lg:px-10">
          <Credits />
          <span className="font-mono text-xs text-muted">© {new Date().getFullYear()} KamKarOAI</span>
        </div>
      </footer>
    </div>
  );
}
