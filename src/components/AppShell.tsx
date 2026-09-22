import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CommandPalette } from "./CommandPalette";
import { FeedbackWidget } from "./FeedbackWidget";
import { Sidebar } from "./Sidebar";
import { SkipLink } from "./SkipLink";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f8]">
      <SkipLink />
      <Sidebar name={session.name} org={session.org} role={session.role} />
      <div id="main" tabIndex={-1} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white outline-none">
        {children}
      </div>
      <CommandPalette role={session.role} />
      <FeedbackWidget />
    </div>
  );
}
