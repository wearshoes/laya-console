import Link from "next/link";
import { notFound } from "next/navigation";
import { LayaMark } from "@/components/LayaMark";
import { getPublicShare } from "@/lib/org";

export const dynamic = "force-dynamic";

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const share = getPublicShare(token);
  if (!share) notFound();
  let pretty = share.state_json;
  try {
    pretty = JSON.stringify(JSON.parse(share.state_json), null, 2);
  } catch {
    pretty = share.state_json;
  }
  return (
    <main className="min-h-screen bg-[#f7f7f8] px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium">
          <LayaMark className="h-6 w-6" />
          Laya
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{share.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{share.preset || "snapshot"}</p>
        <pre className="mt-6 overflow-auto rounded-xl bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-100">
          {pretty}
        </pre>
      </div>
    </main>
  );
}
