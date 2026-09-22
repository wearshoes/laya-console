import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authz";
import { listInvites, listOrgMembers } from "@/lib/org";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireUser();
  if (session instanceof NextResponse) return session;
  return NextResponse.json({
    ok: true,
    org: session.org,
    members: listOrgMembers(session.org),
    invites: listInvites(session.org),
  });
}
