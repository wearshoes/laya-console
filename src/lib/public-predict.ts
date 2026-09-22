import { NextRequest, NextResponse } from "next/server";
import { logAuthFailure, type AuditMeta } from "./audit";
import { findActiveKeyBySecret } from "./keys";
import { requestMeta } from "./request-meta";
import { getUser } from "./users";
import { PRESETS, proxyPredict, rejectWithAudit, type PredictBody } from "./upstream";

function presentedPrefix(secret: string): string | null {
  if (!secret.startsWith("laya_")) return null;
  return secret.slice(0, 12);
}

export async function handlePublicPredict(req: NextRequest, route: string) {
  const { ip, userAgent } = requestMeta(req);
  const apiKey =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    "";

  if (!apiKey) {
    logAuthFailure({ route, ip, userAgent, keyPrefix: null, error: "missing_api_key" });
    return NextResponse.json({ ok: false, error: "missing_api_key" }, { status: 401 });
  }

  const keyRow = findActiveKeyBySecret(apiKey);
  if (!keyRow) {
    logAuthFailure({
      route,
      ip,
      userAgent,
      keyPrefix: presentedPrefix(apiKey),
      error: "invalid_api_key",
    });
    return NextResponse.json({ ok: false, error: "invalid_api_key" }, { status: 401 });
  }

  const user = getUser(keyRow.user_id);
  const meta: AuditMeta = {
    userId: keyRow.user_id,
    email: user?.email ?? null,
    org: user?.org ?? null,
    apiKeyId: keyRow.id,
    keyPrefix: keyRow.key_prefix,
    keyName: keyRow.name,
    route,
    ip,
    userAgent,
  };

  let body: PredictBody;
  try {
    body = await req.json();
  } catch {
    const rejected = rejectWithAudit(meta, null, 400, "invalid_json", null);
    return NextResponse.json(rejected.payload, { status: rejected.status });
  }
  if (body.state === undefined) {
    const rejected = rejectWithAudit(meta, body, 400, "missing_state", body.preset ?? null);
    return NextResponse.json(rejected.payload, { status: rejected.status });
  }
  const preset = body.preset || "triage";
  if (!body.questions && !PRESETS.includes(preset as (typeof PRESETS)[number])) {
    const rejected = rejectWithAudit(meta, body, 400, "unknown_preset", preset);
    return NextResponse.json(rejected.payload, { status: rejected.status });
  }

  const { status, payload } = await proxyPredict(
    { state: body.state, questions: body.questions, preset: body.questions ? body.preset || preset : preset },
    meta
  );
  return NextResponse.json(payload, { status });
}
