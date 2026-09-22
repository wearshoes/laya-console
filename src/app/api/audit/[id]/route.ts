import { NextRequest, NextResponse } from "next/server";
import { getAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/authz";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await ctx.params;
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  const event = getAudit(numeric);
  if (!event) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, event });
}
