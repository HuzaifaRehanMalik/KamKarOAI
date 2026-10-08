import { AppShell } from "@/components/app-shell";
import { isAdmin, requireUser } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={user} isAdmin={isAdmin(user)}>
      {children}
    </AppShell>
  );
}
