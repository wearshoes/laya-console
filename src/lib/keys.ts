import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";

export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret, "utf8").digest("hex");
}

export function generateApiKey(): { secret: string; prefix: string; hash: string } {
  const raw = crypto.randomBytes(24).toString("base64url");
  const secret = `laya_${raw}`;
  const prefix = secret.slice(0, 12);
  return { secret, prefix, hash: hashSecret(secret) };
}

export type ApiKeyRow = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  revoked: number;
  created_at: string;
  revoked_at: string | null;
};

export function createApiKey(userId: string, name: string) {
  const db = getDb();
  const { secret, prefix, hash } = generateApiKey();
  const id = uuidv4();
  db.prepare(
    `INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash) VALUES (?, ?, ?, ?, ?)`
  ).run(id, userId, name.trim() || "default", prefix, hash);
  return { id, name: name.trim() || "default", prefix, secret, created_at: new Date().toISOString() };
}

export function listApiKeys(userId: string) {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, key_prefix, revoked, created_at, revoked_at
       FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(userId) as Array<{
    id: string;
    name: string;
    key_prefix: string;
    revoked: number;
    created_at: string;
    revoked_at: string | null;
  }>;
}

export function revokeApiKey(userId: string, keyId: string): boolean {
  const db = getDb();
  const info = db
    .prepare(
      `UPDATE api_keys SET revoked = 1, revoked_at = datetime('now')
       WHERE id = ? AND user_id = ? AND revoked = 0`
    )
    .run(keyId, userId);
  return info.changes > 0;
}

export function findActiveKeyBySecret(secret: string): ApiKeyRow | null {
  const db = getDb();
  const hash = hashSecret(secret);
  const row = db
    .prepare(`SELECT * FROM api_keys WHERE key_hash = ? AND revoked = 0`)
    .get(hash) as ApiKeyRow | undefined;
  return row || null;
}
