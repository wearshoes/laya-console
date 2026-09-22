import { NextRequest, NextResponse } from "next/server";
import type { AuditMeta } from "@/lib/audit";
import { requireUser } from "@/lib/authz";
import { requestMeta } from "@/lib/request-meta";
import { PRESETS, proxyPredict, rejectWithAudit, type PredictBody } from "@/lib/upstream";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;

  const { ip, userAgent } = requestMeta(req);
  const meta: AuditMeta = {
    userId: session.userId,
    email: session.email,
    org: session.org,
    apiKeyId: null,
    keyPrefix: null,
    keyName: null,
    route: "/api/playground/predict",
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
    {
      state: body.state,
      questions: body.questions,
      preset: body.questions ? body.preset || preset : preset,
    },
    meta
  );
  return NextResponse.json(payload, { status });
}
