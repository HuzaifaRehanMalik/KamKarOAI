import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { VerifyEmailBanner } from "./verify-email-banner";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workflows", label: "Workflows" },
  { href: "/runs", label: "Runs" },
  { href: "/playground", label: "Playground" },
  { href: "/settings", label: "Settings" },
];

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
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="font-bold">KamKarOAI</Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-muted hover:text-foreground">{l.label}</Link>
            ))}
            {isAdmin && <Link href="/admin" className="font-medium text-primary">Admin</Link>}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {!user.emailVerified && <VerifyEmailBanner email={user.email} />}
        <div>{children}</div>
      </main>
    </div>
  );
}
