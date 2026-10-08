import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">KamKarOAI</h1>
      <p className="text-lg text-muted">
        Build AI automation workflows with <b>your own</b> OpenAI, Anthropic or Google API key. Pick any model,
        chain steps together, and run them in one click.
      </p>
      <div className="flex gap-3">
        {session ? (
          <Link href="/dashboard" className="btn-primary">Go to dashboard</Link>
        ) : (
          <>
            <Link href="/signup" className="btn-primary">Get started</Link>
            <Link href="/login" className="btn-outline">Log in</Link>
          </>
        )}
      </div>
    </main>
  );
}
