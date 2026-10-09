import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { AddKeyForm, KeyRow } from "./api-keys";
import { ChangePasswordForm } from "./change-password";

export default async function SettingsPage() {
  const user = await requireUser();
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, provider: true, label: true, last4: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.025em]">Settings</h1>

      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">API keys</h2>
          <p className="text-sm text-muted">
            Keys are encrypted (AES-256-GCM) before they are stored and are never sent back to your browser.
          </p>
        </div>
        {keys.length > 0 && (
          <ul className="divide-y divide-border rounded-md border border-border">
            {keys.map((k) => <KeyRow key={k.id} apiKey={k} />)}
          </ul>
        )}
        <AddKeyForm />
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Change password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
