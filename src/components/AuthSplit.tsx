"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { PixelField } from "./PixelField";

export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-2">
      <aside className="relative order-2 min-h-[220px] overflow-hidden bg-black md:order-1 md:min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/40 to-transparent" />
        <PixelField />
      </aside>
      <main className="relative order-1 flex items-center justify-center px-6 py-16 md:order-2">
        <div className="absolute right-5 top-5">
          <LanguageSwitcher />
        </div>
        {children}
      </main>
    </div>
  );
}
