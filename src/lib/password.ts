import crypto from "crypto";

const N = 16384;
const r = 8;
const p = 1;
const keyLen = 32;

/** scrypt hash: scrypt$N$r$p$salt$hash (base64url). No plaintext passwords are stored. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto.scryptSync(password, salt, keyLen, { N, r, p }).toString("base64url");
  return `scrypt$${N}$${r}$${p}$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const n = Number(parts[1]);
  const rr = Number(parts[2]);
  const pp = Number(parts[3]);
  const salt = parts[4];
  let expected: Buffer;
  try {
    expected = Buffer.from(parts[5], "base64url");
  } catch {
    return false;
  }
  if (!Number.isFinite(n) || !Number.isFinite(rr) || !Number.isFinite(pp)) return false;
  if (n < 1024 || n > 262144 || rr < 1 || rr > 32 || pp < 1 || pp > 8) return false;
  if (expected.length < 16 || expected.length > 64) return false;
  let actual: Buffer;
  try {
    actual = crypto.scryptSync(password, salt, expected.length, { N: n, r: rr, p: pp });
  } catch {
    return false;
  }
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}
