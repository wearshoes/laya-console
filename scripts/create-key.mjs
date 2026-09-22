#!/usr/bin/env node
/**
 * Sign in and create an API key.
 * Usage: node scripts/create-key.mjs <baseUrl> <email> <password> [keyName]
 */
const base = process.argv[2] || "http://127.0.0.1:8787";
const email = process.argv[3];
const password = process.argv[4];
const name = process.argv[5] || "Production key";

if (!email || !password) {
  console.error("Usage: node scripts/create-key.mjs <baseUrl> <email> <password> [keyName]");
  process.exit(1);
}

const login = await fetch(`${base}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const loginBody = await login.json();
if (!login.ok) {
  console.error("login failed", login.status, loginBody);
  process.exit(1);
}
const cookie = login.headers.getSetCookie?.()?.[0] || login.headers.get("set-cookie");
if (!cookie) {
  console.error("no session cookie returned");
  process.exit(1);
}
const cookieHeader = cookie.split(";")[0];

const create = await fetch(`${base}/api/keys`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Cookie: cookieHeader },
  body: JSON.stringify({ name }),
});
const created = await create.json();
if (!create.ok) {
  console.error("create key failed", create.status, created);
  process.exit(1);
}
console.log(JSON.stringify({ id: created.key.id, name: created.key.name, prefix: created.key.key_prefix }, null, 2));
console.log("\nSECRET=" + created.key.secret);
