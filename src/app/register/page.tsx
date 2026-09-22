import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { RegisterForm } from "./ui";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/home");
  return <RegisterForm />;
}
