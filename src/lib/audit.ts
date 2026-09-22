import { getDb } from "./db";

const MAX_JSON = 500_000;

export type AuditMeta = {
  userId: string | null;
  email: string | null;
  org: string | null;
  apiKeyId: string | null;
  keyPrefix: string | null;
  keyName: string | null;
  route: string;
  ip: string | null;
  userAgent: string | null;
};

export function clipJson(value: unknown): string | null {
  if (value === undefined) return null;
  let text: string;
  try {
    text = JSON.stringify(value);
  } catch {
    text = JSON.stringify({ error: "unserializable" });
  }
  if (text.length <= MAX_JSON) return text;
  return JSON.stringify({
    _truncated: true,
    preview: text.slice(0, MAX_JSON),
  });
}

/** Insert the audit row before any upstream model call. Returns null if it cannot be stored. */
export function beginAudit(meta: AuditMeta, request: unknown, preset: string | null): number | null {
  try {
    const info = getDb()
      .prepare(
        `INSERT INTO audit_events (
           user_id, email, org, api_key_id, key_prefix, key_name, route, preset,
           ip, user_agent, request_json, auth_failure
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
      )
      .run(
        meta.userId,
        meta.email,
        meta.org,
        meta.apiKeyId,
        meta.keyPrefix,
        meta.keyName,
        meta.route,
        preset,
        meta.ip,
        meta.userAgent,
        clipJson(request)
      );
    return Number(info.lastInsertRowid);
  } catch {
    return null;
  }
}

export function finishAudit(id: number, status: number, latencyMs: number, response: unknown) {
  try {
    getDb()
      .prepare(
        `UPDATE audit_events SET status = ?, latency_ms = ?, response_json = ? WHERE id = ?`
      )
      .run(status, latencyMs, clipJson(response), id);
  } catch {
    // The pre-call row remains for review even if the response update fails.
  }
}

/** Auth failures store no request body and never the raw API secret. */
export function logAuthFailure(input: {
  route: string;
  ip: string | null;
  userAgent: string | null;
  keyPrefix: string | null;
  error: string;
}) {
  const prefix =
    input.keyPrefix && input.keyPrefix.startsWith("laya_") ? input.keyPrefix.slice(0, 12) : null;
  try {
    getDb()
      .prepare(
        `INSERT INTO audit_events (
           route, key_prefix, status, latency_ms, ip, user_agent, request_json, response_json, auth_failure
         ) VALUES (?, ?, 401, 0, ?, ?, NULL, ?, 1)`
      )
      .run(
        input.route,
        prefix,
        input.ip,
        input.userAgent,
        JSON.stringify({ ok: false, error: input.error })
      );
  } catch {
    // ignore
  }
}

export type AuditFilters = {
  q?: string;
  userId?: string;
  apiKeyId?: string;
  status?: string;
  from?: string;
  to?: string;
  kind?: string;
  limit: number;
  offset: number;
};

function like(q: string) {
  return `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}

function whereClause(filters: AuditFilters) {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters.kind === "model") where.push("auth_failure = 0");
  else if (filters.kind === "auth") where.push("auth_failure = 1");

  if (filters.userId) {
    where.push("user_id = ?");
    params.push(filters.userId);
  }
  if (filters.apiKeyId === "session") {
    where.push("api_key_id IS NULL AND auth_failure = 0");
  } else if (filters.apiKeyId) {
    where.push("api_key_id = ?");
    params.push(filters.apiKeyId);
  }
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) {
    where.push("date(created_at) >= ?");
    params.push(filters.from);
  }
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) {
    where.push("date(created_at) <= ?");
    params.push(filters.to);
  }
  if (filters.status === "2xx") where.push("status BETWEEN 200 AND 299");
  else if (filters.status === "4xx") where.push("status BETWEEN 400 AND 499");
  else if (filters.status === "5xx") where.push("status BETWEEN 500 AND 599");
  else if (filters.status && /^\d{3}$/.test(filters.status)) {
    where.push("status = ?");
    params.push(Number(filters.status));
  }
  if (filters.q && filters.q.trim()) {
    const pattern = like(filters.q.trim().slice(0, 200));
    where.push(
      `(IFNULL(email,'') LIKE ? ESCAPE '\\' OR IFNULL(org,'') LIKE ? ESCAPE '\\'
        OR IFNULL(key_name,'') LIKE ? ESCAPE '\\' OR IFNULL(key_prefix,'') LIKE ? ESCAPE '\\'
        OR route LIKE ? ESCAPE '\\' OR IFNULL(preset,'') LIKE ? ESCAPE '\\'
        OR IFNULL(request_json,'') LIKE ? ESCAPE '\\' OR IFNULL(response_json,'') LIKE ? ESCAPE '\\')`
    );
    for (let i = 0; i < 8; i++) params.push(pattern);
  }
  const sql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { sql, params };
}

export type AuditListItem = {
  id: number;
  user_id: string | null;
  email: string | null;
  org: string | null;
  api_key_id: string | null;
  key_prefix: string | null;
  key_name: string | null;
  route: string;
  preset: string | null;
  status: number | null;
  latency_ms: number | null;
  ip: string | null;
  user_agent: string | null;
  auth_failure: number;
  created_at: string;
  request_bytes: number;
  response_bytes: number;
};

export function listAudits(filters: AuditFilters): { total: number; events: AuditListItem[] } {
  const db = getDb();
  const { sql, params } = whereClause(filters);
  const totalRow = db.prepare(`SELECT COUNT(*) AS c FROM audit_events ${sql}`).get(...params) as {
    c: number;
  };
  const events = db
    .prepare(
      `SELECT id, user_id, email, org, api_key_id, key_prefix, key_name, route, preset,
              status, latency_ms, ip, user_agent, auth_failure, created_at,
              LENGTH(IFNULL(request_json,'')) AS request_bytes,
              LENGTH(IFNULL(response_json,'')) AS response_bytes
       FROM audit_events ${sql}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
    )
    .all(...params, filters.limit, filters.offset) as AuditListItem[];
  return { total: Number(totalRow.c) || 0, events };
}

export function getAudit(id: number) {
  return (
    (getDb()
      .prepare(
        `SELECT id, user_id, email, org, api_key_id, key_prefix, key_name, route, preset,
                status, latency_ms, ip, user_agent, request_json, response_json, auth_failure, created_at
         FROM audit_events WHERE id = ?`
      )
      .get(id) as Record<string, unknown> | undefined) || null
  );
}
