import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/authz";
import { addFeedback, listFeedback } from "@/lib/org";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ ok: true, feedback: listFeedback() });
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  let body: { category?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const id = addFeedback({
    userId: session.userId,
    email: session.email,
    category: body.category || "other",
    message: body.message || "",
  });
  if (!id) return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  return NextResponse.json({ ok: true, id });
}
