import { NextRequest } from "next/server";
import { handlePublicPredict } from "@/lib/public-predict";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handlePublicPredict(req, "/predict");
}
