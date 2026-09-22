import crypto from "crypto";
import { cookies } from "next/headers";
import { getUser, type Role } from "./users";

const COOKIE = "laya_session";
const MAX_AGE = 60 * 60 * 24 * 14;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  org: string;
  role: Role;
  exp: number;
};

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function b64url(buf: Buffer | string): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString("base64url");
}

function sign(data: string): string {
  return crypto.createHmac("sha256", secret()).update(data).digest("base64url");
}

export function encodeSession(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const body = b64url(JSON.stringify(full));
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token || !process.env.SESSION_SECRET) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.userId) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Omit<SessionPayload, "exp">) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production" && process.env.FORCE_SECURE_COOKIE === "1",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Role, name, and org always come from the database, not the cookie hint. */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const payload = decodeSession(jar.get(COOKIE)?.value);
  if (!payload) return null;
  const user = getUser(payload.userId);
  if (!user) return null;
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    org: user.org,
    role: user.role === "admin" ? "admin" : "member",
    exp: payload.exp,
  };
}

export { COOKIE as SESSION_COOKIE, MAX_AGE as SESSION_MAX_AGE };
