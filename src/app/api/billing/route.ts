import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { dailyUsage } from "@/lib/upstream";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  const days = dailyUsage(session.role === "admin" ? undefined : session.userId);
  const requests = days.reduce((sum, day) => sum + Number(day.requests || 0), 0);
  return NextResponse.json({
    ok: true,
    charging: false,
    plan: "developer-preview",
    currency: "USD",
    amountDue: 0,
    includedCredits: 10000,
    usedCredits: 0,
    meteredRequests: requests,
  });
}
