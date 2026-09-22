import { beginAudit, finishAudit, type AuditMeta } from "./audit";
import { getDb } from "./db";

const PRESETS = ["triage", "email", "guard", "moderation", "router"] as const;
export type Preset = (typeof PRESETS)[number];
export { PRESETS };

export function upstreamBase(): string {
  return (process.env.LAYA_UPSTREAM_URL || "https://laya.wearglass.work").replace(/\/$/, "");
}

export function upstreamApiKey(): string {
  return process.env.LAYA_UPSTREAM_API_KEY || "";
}

export type PredictBody = {
  state: unknown;
  questions?: unknown;
  preset?: string;
};

export async function proxyPredict(body: PredictBody, meta: AuditMeta) {
  const preset = typeof body.preset === "string" ? body.preset : null;
  const auditId = beginAudit(meta, body, preset);
  if (auditId == null) {
    return {
      status: 503,
      payload: { ok: false, error: "audit_failed" },
      latency: 0,
    };
  }

  const t0 = Date.now();
  const url = `${upstreamBase()}/predict`;
  const key = upstreamApiKey();
  let status = 502;
  let payload: unknown = { ok: false, error: "upstream_unreachable" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "X-API-Key": key } : {}),
      },
      body: JSON.stringify(body),
    });
    status = res.status;
    const text = await res.text();
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { ok: false, error: "invalid_upstream_json", raw: text.slice(0, 500) };
    }
  } catch (e) {
    status = 502;
    payload = { ok: false, error: e instanceof Error ? e.message : "upstream_unreachable" };
  }

  const latency = Date.now() - t0;
  finishAudit(auditId, status, latency, payload);
  return { status, payload, latency };
}

export function rejectWithAudit(
  meta: AuditMeta,
  request: unknown,
  status: number,
  error: string,
  preset: string | null
) {
  const payload = { ok: false, error };
  const auditId = beginAudit(meta, request, preset);
  if (auditId == null) {
    return { status: 503, payload: { ok: false, error: "audit_failed" } };
  }
  finishAudit(auditId, status, 0, payload);
  return { status, payload };
}

export function dailyUsage(userId?: string) {
  const db = getDb();
  const where = ["auth_failure = 0", "status IS NOT NULL"];
  const params: unknown[] = [];
  if (userId) {
    where.push("user_id = ?");
    params.push(userId);
  }
  return db
    .prepare(
      `SELECT date(created_at) AS day,
              COUNT(*) AS requests,
              SUM(CASE WHEN status BETWEEN 200 AND 299 THEN 1 ELSE 0 END) AS ok,
              ROUND(AVG(latency_ms)) AS avg_latency_ms
       FROM audit_events
       WHERE ${where.join(" AND ")}
       GROUP BY date(created_at)
       ORDER BY day DESC
       LIMIT 60`
    )
    .all(...params) as Array<{
    day: string;
    requests: number;
    ok: number;
    avg_latency_ms: number | null;
  }>;
}
