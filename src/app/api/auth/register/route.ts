import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { createUser, toPublic } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const result = createUser({
    email: body.email || "",
    password: body.password || "",
    name: body.name,
  });
  if (!result.ok) {
    const status = result.error === "email_taken" ? 409 : 400;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  const pub = toPublic(result.user);
  await setSessionCookie({
    userId: pub.id,
    email: pub.email,
    name: pub.name,
    org: pub.org,
    role: pub.role,
  });
  return NextResponse.json({ ok: true, user: pub });
}
