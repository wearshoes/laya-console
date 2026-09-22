import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/home");
  const params = await searchParams;
  return <LoginForm returnTo={params.returnTo || "/home"} />;
}
