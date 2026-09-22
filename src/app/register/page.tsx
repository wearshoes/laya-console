import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RegisterForm } from "./ui";

export const dynamic = "force-dynamic";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/home");
  const params = await searchParams;
  const invite = typeof params.invite === "string" ? params.invite : "";
  return <RegisterForm invite={invite} />;
}
