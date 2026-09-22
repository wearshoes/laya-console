import { AppShell } from "@/components/AppShell";
import { PublicDocsShell } from "@/components/PublicDocsShell";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <PublicDocsShell>{children}</PublicDocsShell>;
  return <AppShell>{children}</AppShell>;
}
