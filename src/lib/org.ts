import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import type { PublicUser } from "./users";

export type Invite = {
  id: string;
  token: string;
  org: string;
  email: string;
  created_by: string;
  created_at: string;
  accepted_at: string | null;
};

export type Share = {
  id: string;
  token: string;
  user_id: string;
  org: string;
  title: string;
  preset: string | null;
  state_json: string;
  revoked: number;
  created_at: string;
};

export function listOrgMembers(org: string): PublicUser[] {
  const rows = getDb()
    .prepare(
      `SELECT id, email, name, org, role, created_at FROM users WHERE org = ? ORDER BY email`
    )
    .all(org) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    org: String(row.org),
    role: row.role === "admin" ? "admin" : "member",
    created_at: String(row.created_at),
  }));
}

export function listInvites(org: string): Invite[] {
  return getDb()
    .prepare(
      `SELECT id, token, org, email, created_by, created_at, accepted_at
       FROM org_invites WHERE org = ? ORDER BY created_at DESC`
    )
    .all(org) as Invite[];
}

export function createInvite(org: string, email: string, createdBy: string): Invite {
  const token = crypto.randomBytes(9).toString("base64url");
  const id = uuidv4();
  const normalized = email.trim().toLowerCase();
  getDb()
    .prepare(
      `INSERT INTO org_invites (id, token, org, email, created_by) VALUES (?, ?, ?, ?, ?)`
    )
    .run(id, token, org, normalized, createdBy);
  return getDb().prepare(`SELECT * FROM org_invites WHERE id = ?`).get(id) as Invite;
}

export function peekInvite(token: string): Invite | null {
  const row = getDb()
    .prepare(`SELECT * FROM org_invites WHERE token = ? AND accepted_at IS NULL`)
    .get(token) as Invite | undefined;
  return row || null;
}

export function consumeInvite(token: string, email: string): string | null {
  const invite = peekInvite(token);
  if (!invite) return null;
  if (invite.email !== email.trim().toLowerCase()) return null;
  getDb().prepare(`UPDATE org_invites SET accepted_at = datetime('now') WHERE id = ?`).run(invite.id);
  return invite.org;
}

export function createShare(input: {
  userId: string;
  org: string;
  title: string;
  preset: string | null;
  state: unknown;
}): Share {
  const id = uuidv4();
  const token = crypto.randomBytes(9).toString("base64url");
  getDb()
    .prepare(
      `INSERT INTO shares (id, token, user_id, org, title, preset, state_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      token,
      input.userId,
      input.org,
      input.title.slice(0, 80) || "Untitled",
      input.preset,
      JSON.stringify(input.state ?? {})
    );
  return getDb().prepare(`SELECT * FROM shares WHERE id = ?`).get(id) as Share;
}

export function listShares(userId: string, admin: boolean): Share[] {
  if (admin) {
    return getDb()
      .prepare(`SELECT * FROM shares ORDER BY created_at DESC`)
      .all() as Share[];
  }
  return getDb()
    .prepare(`SELECT * FROM shares WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId) as Share[];
}

export function revokeShare(id: string, userId: string, admin: boolean): boolean {
  const sql = admin
    ? `UPDATE shares SET revoked = 1 WHERE id = ? AND revoked = 0`
    : `UPDATE shares SET revoked = 1 WHERE id = ? AND user_id = ? AND revoked = 0`;
  const info = admin
    ? getDb().prepare(sql).run(id)
    : getDb().prepare(sql).run(id, userId);
  return info.changes > 0;
}

export function getPublicShare(token: string): Share | null {
  const row = getDb()
    .prepare(`SELECT * FROM shares WHERE token = ? AND revoked = 0`)
    .get(token) as Share | undefined;
  return row || null;
}

export function addFeedback(input: {
  userId: string;
  email: string;
  category: string;
  message: string;
}) {
  const category = ["bug", "idea", "other"].includes(input.category) ? input.category : "other";
  const message = input.message.trim().slice(0, 2000);
  if (!message) return null;
  const info = getDb()
    .prepare(`INSERT INTO feedback (user_id, email, category, message) VALUES (?, ?, ?, ?)`)
    .run(input.userId, input.email, category, message);
  return Number(info.lastInsertRowid);
}

export function listFeedback() {
  return getDb()
    .prepare(
      `SELECT id, email, category, message, created_at FROM feedback ORDER BY id DESC LIMIT 100`
    )
    .all();
}
