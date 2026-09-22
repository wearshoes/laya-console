import { forbidden, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?returnTo=/audit");
  if (session.role !== "admin") forbidden();
  return <AppShell>{children}</AppShell>;
}
