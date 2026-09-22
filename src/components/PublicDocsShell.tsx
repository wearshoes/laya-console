import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LayaMark } from "./LayaMark";
import { ThemeToggle } from "./ThemeToggle";
import { DocsSignIn } from "./DocsSignIn";

export function PublicDocsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.14em]">
          <LayaMark className="h-6 w-6" />
          LAYA
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <DocsSignIn />
        </div>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
