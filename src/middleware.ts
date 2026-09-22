import { NextRequest, NextResponse } from "next/server";

const COOKIE = "laya_session";

function isProtected(pathname: string) {
  return [
    "/home",
    "/playground",
    "/usage",
    "/keys",
    "/docs",
    "/audit",
    "/admin",
  ].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/playground",
    "/playground/:path*",
    "/usage",
    "/usage/:path*",
    "/keys",
    "/keys/:path*",
    "/docs",
    "/docs/:path*",
    "/audit",
    "/audit/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
