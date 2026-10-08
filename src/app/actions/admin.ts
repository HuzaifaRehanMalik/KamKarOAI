"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAdmin, requireAdmin } from "@/lib/session";

async function targetUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { email: true, emailVerified: true } });
  if (!user) throw new Error("User not found");
  if (isAdmin(user)) throw new Error("The admin account cannot be modified here");
  return user;
}

export async function setUserDisabled(id: string, disabled: boolean) {
  await requireAdmin();
  await targetUser(id);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { disabled } }),
    // Kick the user out immediately when disabling.
    ...(disabled ? [prisma.session.deleteMany({ where: { userId: id } })] : []),
  ]);
  revalidatePath("/admin");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await targetUser(id);
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin");
}
