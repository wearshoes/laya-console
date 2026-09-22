import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { dailyUsage, PRESETS } from "@/lib/upstream";
import { listUsers } from "@/lib/users";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  const preset = req.nextUrl.searchParams.get("preset") || "";
  const outcomeParam = req.nextUrl.searchParams.get("outcome");
  const filters: { preset?: string; outcome: "all" | "ok" | "error" } = {
    preset: (PRESETS as readonly string[]).includes(preset) ? preset : undefined,
    outcome: outcomeParam === "ok" || outcomeParam === "error" ? outcomeParam : "all",
  };

  if (session.role === "admin") {
    const userId = req.nextUrl.searchParams.get("userId") || undefined;
    return NextResponse.json({
      ok: true,
      scope: "all",
      days: dailyUsage(userId, filters),
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
    days: dailyUsage(session.userId, filters),
  });
}
