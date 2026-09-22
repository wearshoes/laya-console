import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { hashPassword, verifyPassword } from "./password";

export type Role = "member" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  org: string;
  role: Role;
  password_hash: string | null;
  created_at: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  org: string;
  role: Role;
  created_at: string;
};

export function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    org: user.org,
    role: user.role === "admin" ? "admin" : "member",
    created_at: user.created_at,
  };
}

export function isAdminEmail(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

function asRole(value: unknown): Role {
  return value === "admin" ? "admin" : "member";
}

export function displayFromEmail(email: string): { name: string; org: string } {
  const local = email.split("@")[0] || "user";
  if (/hao/i.test(local) || /wei/i.test(local)) {
    return { name: "hao wei", org: "hao's org" };
  }
  const name = local.replace(/[._-]+/g, " ").trim() || "user";
  const first = name.split(" ")[0] || "user";
  return { name, org: `${first}'s org` };
}

function rowToUser(row: Record<string, unknown> | undefined): User | null {
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    org: String(row.org),
    role: asRole(row.role),
    password_hash: row.password_hash == null ? null : String(row.password_hash),
    created_at: String(row.created_at),
  };
}

export function getUser(id: string): User | null {
  const row = getDb().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  return rowToUser(row);
}

export function getUserByEmail(email: string): User | null {
  const row = getDb()
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as Record<string, unknown> | undefined;
  return rowToUser(row);
}

function promoteIfListed(user: User): User {
  if (isAdminEmail(user.email) && user.role !== "admin") {
    getDb().prepare(`UPDATE users SET role = 'admin' WHERE id = ?`).run(user.id);
    return { ...user, role: "admin" };
  }
  return user;
}

let dummyHash: string | null = null;

export function createUser(input: {
  email: string;
  password: string;
  name?: string;
  org?: string;
}): { ok: true; user: User } | { ok: false; error: "invalid_email" | "password_short" | "email_taken" } {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: "invalid_email" };
  }
  if (input.password.length < 8 || input.password.length > 128) {
    return { ok: false, error: "password_short" };
  }
  if (getUserByEmail(email)) return { ok: false, error: "email_taken" };

  const derived = displayFromEmail(email);
  const name = (input.name || "").trim().slice(0, 80) || derived.name;
  const org = (input.org || "").trim().slice(0, 80) || derived.org;
  const role: Role = isAdminEmail(email) ? "admin" : "member";
  const id = uuidv4();
  const password_hash = hashPassword(input.password);
  getDb()
    .prepare(
      `INSERT INTO users (id, email, name, org, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(id, email, name, org, role, password_hash);
  const user = getUser(id);
  if (!user) return { ok: false, error: "invalid_email" };
  return { ok: true, user };
}

export function authenticate(email: string, password: string): User | null {
  const user = getUserByEmail(email);
  if (!user?.password_hash) {
    if (!dummyHash) dummyHash = hashPassword("laya-timing-placeholder");
    verifyPassword(password, dummyHash);
    return null;
  }
  if (!verifyPassword(password, user.password_hash)) return null;
  return promoteIfListed(user);
}

export function upsertPassword(email: string, password: string, name?: string) {
  if (password.length < 8 || password.length > 128) {
    return { ok: false as const, error: "password_short" };
  }
  const normalized = email.trim().toLowerCase();
  const existing = getUserByEmail(normalized);
  if (!existing) {
    return createUser({ email: normalized, password, name });
  }
  const password_hash = hashPassword(password);
  getDb().prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(password_hash, existing.id);
  promoteIfListed(existing);
  return { ok: true as const, user: getUser(existing.id)! };
}

export function listUsers(): PublicUser[] {
  const rows = getDb()
    .prepare(
      `SELECT id, email, name, org, role, created_at FROM users ORDER BY datetime(created_at) DESC`
    )
    .all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    org: String(row.org),
    role: asRole(row.role),
    created_at: String(row.created_at),
  }));
}

export function updateDisplayName(userId: string, name: string): PublicUser | null {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return null;
  const info = getDb().prepare(`UPDATE users SET name = ? WHERE id = ?`).run(trimmed, userId);
  if (!info.changes) return null;
  const user = getUser(userId);
  return user ? toPublic(user) : null;
}

export function setUserRole(
  targetId: string,
  role: Role
): { ok: true; user: PublicUser } | { ok: false; error: "not_found" | "invalid_role" | "last_admin" } {
  if (role !== "admin" && role !== "member") return { ok: false, error: "invalid_role" };
  const target = getUser(targetId);
  if (!target) return { ok: false, error: "not_found" };
  if (role === "member" && target.role === "admin") {
    const count = getDb().prepare(`SELECT COUNT(*) AS c FROM users WHERE role = 'admin'`).get() as {
      c: number;
    };
    if (Number(count.c) <= 1) return { ok: false, error: "last_admin" };
  }
  getDb().prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, targetId);
  const updated = getUser(targetId);
  if (!updated) return { ok: false, error: "not_found" };
  return { ok: true, user: toPublic(updated) };
}
