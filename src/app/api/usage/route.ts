import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { dailyUsage } from "@/lib/upstream";
import { listUsers } from "@/lib/users";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  if (session.role === "admin") {
    const userId = req.nextUrl.searchParams.get("userId") || undefined;
    return NextResponse.json({
      ok: true,
      scope: "all",
      days: dailyUsage(userId),
      accounts: listUsers().map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        org: u.org,
      })),
    });
  }

  return NextResponse.json({
    ok: true,
    scope: "own",
    days: dailyUsage(session.userId),
  });
}
