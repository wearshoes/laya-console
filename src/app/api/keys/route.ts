import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { createApiKey, listApiKeys } from "@/lib/keys";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({
    ok: true,
    keys: listApiKeys(session.userId),
    creator: session.name,
  });
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const name = (body.name || "").trim().slice(0, 80);
  const created = createApiKey(session.userId, name || "default");
  return NextResponse.json({
    ok: true,
    key: {
      id: created.id,
      name: created.name,
      key_prefix: created.prefix,
      secret: created.secret,
      created_at: created.created_at,
    },
  });
}
