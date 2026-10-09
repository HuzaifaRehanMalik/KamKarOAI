import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export function isAdminEmail(email: string | null | undefined) {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!admin && email?.trim().toLowerCase() === admin;
}

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** For server components / actions: returns the signed-in user or redirects to /login. */
export async function requireUser() {
  const session = await getSession();
  if (!session || session.user.disabled) redirect("/login");
  return session.user;
}

/**
 * Admin gate. Always checked on the server. Never rely on hiding UI.
 * Requires a verified email so nobody can claim admin by signing up with the
 * admin address before its real owner does.
 */
export function isAdmin(user: { email: string; emailVerified: boolean }) {
  return isAdminEmail(user.email) && user.emailVerified;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/dashboard");
  return user;
}
