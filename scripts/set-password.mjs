#!/usr/bin/env node
/**
 * Set or create a console password.
 * Usage: node scripts/set-password.mjs <email> <password>
 *
 * Hash format matches src/lib/password.ts:
 *   scrypt$16384$8$1$<salt>$<hash>  (base64url, Node scrypt)
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const email = (process.argv[2] || "").trim().toLowerCase();
const password = process.argv[3] || "";

if (!email || !password) {
  console.error("Usage: node scripts/set-password.mjs <email> <password>");
  process.exit(1);
}
if (password.length < 8 || password.length > 128) {
  console.error("Password must be 8–128 characters");
  process.exit(1);
}

loadEnv(path.join(process.cwd(), ".env.local"));

const N = 16384;
const r = 8;
const p = 1;
const salt = crypto.randomBytes(16).toString("base64url");
const hash = crypto.scryptSync(password, salt, 32, { N, r, p }).toString("base64url");
const passwordHash = `scrypt$${N}$${r}$${p}$${salt}$${hash}`;

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "laya-console.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    org TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    password_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const admins = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const role = admins.includes(email) ? "admin" : "member";
const existing = db.prepare(`SELECT id, role FROM users WHERE email = ?`).get(email);

if (existing) {
  const nextRole = existing.role === "admin" || role === "admin" ? "admin" : "member";
  db.prepare(`UPDATE users SET password_hash = ?, role = ? WHERE id = ?`).run(passwordHash, nextRole, existing.id);
  console.log(`Updated password for ${email} (${nextRole})`);
} else {
  const local = email.split("@")[0] || "user";
  const name = /hao|wei/i.test(local) ? "hao wei" : local.replace(/[._-]+/g, " ");
  const org = /hao|wei/i.test(local) ? "hao's org" : `${name.split(" ")[0]}'s org`;
  db.prepare(
    `INSERT INTO users (id, email, name, org, role, password_hash) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), email, name, org, role, passwordHash);
  console.log(`Created ${email} (${role})`);
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
