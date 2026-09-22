import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { listUsers } from "@/lib/users";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ ok: true, users: listUsers(), actorId: session.userId });
}
