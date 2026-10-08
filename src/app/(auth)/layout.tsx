import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-6 text-xl font-bold">KamKarOAI</Link>
      <div className="card w-full max-w-sm">{children}</div>
    </main>
  );
}
