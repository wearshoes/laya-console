import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { createShare, listShares } from "@/lib/org";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  const shares = listShares(session.userId, session.role === "admin").map((share) => ({
    id: share.id,
    token: share.token,
    title: share.title,
    preset: share.preset,
    org: share.org,
    revoked: share.revoked,
    created_at: share.created_at,
  }));
  return NextResponse.json({ ok: true, shares });
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  let body: { title?: string; preset?: string; state?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (body.state === undefined) {
    return NextResponse.json({ ok: false, error: "missing_state" }, { status: 400 });
  }
  const share = createShare({
    userId: session.userId,
    org: session.org,
    title: body.title || "Playground snapshot",
    preset: body.preset || null,
    state: body.state,
  });
  return NextResponse.json({
    ok: true,
    share: { id: share.id, token: share.token, title: share.title, preset: share.preset },
  });
}
