import { NextRequest, NextResponse } from "next/server";
import { listAudits } from "@/lib/audit";
import { requireAdmin } from "@/lib/authz";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") || 40) || 40));
  const offset = Math.max(0, Number(sp.get("offset") || 0) || 0);
  const { total, events } = listAudits({
    q: sp.get("q") || undefined,
    userId: sp.get("userId") || undefined,
    apiKeyId: sp.get("apiKeyId") || undefined,
    status: sp.get("status") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
    kind: sp.get("kind") || undefined,
    limit,
    offset,
  });

  const db = getDb();
  const accounts = db
    .prepare(`SELECT id, email, name, org FROM users ORDER BY email`)
    .all() as Array<{ id: string; email: string; name: string; org: string }>;
  const keys = db
    .prepare(
      `SELECT k.id, k.name, k.key_prefix, k.user_id, k.revoked, u.email
       FROM api_keys k JOIN users u ON u.id = k.user_id
       ORDER BY k.created_at DESC`
    )
    .all() as Array<{
    id: string;
    name: string;
    key_prefix: string;
    user_id: string;
    revoked: number;
    email: string;
  }>;

  return NextResponse.json({ ok: true, total, events, accounts, keys, limit, offset });
}
