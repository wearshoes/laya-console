import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "./Sidebar";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f8]">
      <Sidebar name={session.name} org={session.org} role={session.role} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}
