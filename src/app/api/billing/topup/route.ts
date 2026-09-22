import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";

export const runtime = "nodejs";

export async function POST() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  return NextResponse.json(
    { ok: false, error: "payments_disabled", charging: false },
    { status: 501 }
  );
}
