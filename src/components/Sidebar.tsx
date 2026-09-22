"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/lib/users";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LayaMark } from "./LayaMark";
import { useI18n } from "./LocaleProvider";

export function Sidebar({ name, org, role }: { name: string; org: string; role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "LC";

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    return () => window.removeEventListener("mousedown", onPointer);
  }, []);

  const items = [
    { href: "/home", label: t("nav.home"), icon: HomeIcon },
    { href: "/playground", label: t("nav.playground"), icon: FlaskIcon },
    { href: "/usage", label: t("nav.usage"), icon: ChartIcon },
    ...(role === "admin" ? [{ href: "/audit", label: t("nav.audit"), icon: AuditIcon }] : []),
    { href: "/keys", label: t("nav.keys"), icon: KeyIcon },
    { href: "/docs", label: t("nav.docs"), icon: BookIcon },
    ...(role === "admin" ? [{ href: "/admin", label: t("nav.team"), icon: TeamIcon }] : []),
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-5">
        <LayaMark className="h-6 w-6 text-neutral-950" />
        <span className="text-[13px] font-semibold tracking-[0.16em] text-neutral-950">LAYA</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition duration-150 ${
                active
                  ? "bg-neutral-100 font-medium text-neutral-950 shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-2">
        <LanguageSwitcher />
      </div>
      <div className="relative border-t border-neutral-200 p-3" ref={menuRef}>
        {open && (
          <div className="fade-in absolute bottom-16 left-3 right-3 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg">
            <p className="px-3 py-2 text-xs text-neutral-500">
              {role === "admin" ? t("common.admin") : t("common.member")}
            </p>
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-800 transition hover:bg-neutral-50"
            >
              {t("common.signOut")}
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-neutral-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-neutral-950">{name}</span>
            <span className="block truncate text-xs text-neutral-500">{org}</span>
          </span>
          <Chevron />
        </button>
      </div>
    </aside>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}
function FlaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="15" r="3.2" />
      <path d="M11 13.2 20 4.5 21.5 6 18 9.2l1.4 1.3-1.6 1.5" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5z" />
      <path d="M5 20.5A2.5 2.5 0 0 1 7.5 18H20" />
    </svg>
  );
}
function AuditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 3h7l5 5v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v5h5M9 13h7M9 17h5" />
    </svg>
  );
}
function TeamIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="10" r="2.2" />
      <path d="M16 19a4.5 4.5 0 0 1 4.5-4" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}
