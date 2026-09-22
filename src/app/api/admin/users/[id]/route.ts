import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { setUserRole, type Role } from "@/lib/users";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  const { id } = await ctx.params;
  let body: { role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const role = body.role === "admin" || body.role === "member" ? (body.role as Role) : null;
  if (!role) return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  const result = setUserRole(id, role);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, user: result.user });
}
