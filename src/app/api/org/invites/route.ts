import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { createInvite } from "@/lib/org";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = (body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  const invite = createInvite(session.org, email, session.userId);
  return NextResponse.json({
    ok: true,
    invite: {
      id: invite.id,
      email: invite.email,
      token: invite.token,
      org: invite.org,
    },
  });
}
