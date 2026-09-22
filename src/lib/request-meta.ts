import type { NextRequest } from "next/server";

export function requestMeta(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded?.split(",")[0] || req.headers.get("x-real-ip") || "").trim().slice(0, 64);
  const userAgent = (req.headers.get("user-agent") || "").slice(0, 400);
  return { ip, userAgent };
}
