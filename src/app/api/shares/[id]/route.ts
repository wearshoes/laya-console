import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { revokeShare } from "@/lib/org";

export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  const { id } = await ctx.params;
  const ok = revokeShare(id, session.userId, session.role === "admin");
  if (!ok) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
