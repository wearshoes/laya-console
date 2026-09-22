import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { updateDisplayName } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({
    ok: true,
    user: {
      email: session.email,
      name: session.name,
      org: session.org,
      role: session.role,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const user = updateDisplayName(session.userId, body.name || "");
  if (!user) return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  return NextResponse.json({ ok: true, user });
}
