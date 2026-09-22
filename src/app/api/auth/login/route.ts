import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { authenticate, toPublic } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = (body.email || "").trim();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }
  const user = authenticate(email, password);
  if (!user) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }
  const pub = toPublic(user);
  await setSessionCookie({
    userId: pub.id,
    email: pub.email,
    name: pub.name,
    org: pub.org,
    role: pub.role,
  });
  return NextResponse.json({ ok: true, user: pub });
}
