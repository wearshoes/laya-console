import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./session";

export async function requireUser(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload | NextResponse> {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  if (session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return session;
}
