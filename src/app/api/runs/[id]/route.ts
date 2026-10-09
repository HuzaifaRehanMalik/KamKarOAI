import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.user.disabled) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const run = await prisma.workflowRun.findFirst({ where: { id, userId: session.user.id } });
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  return NextResponse.json({ run });
}
