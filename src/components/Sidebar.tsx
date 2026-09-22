"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Role } from "@/lib/users";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LayaMark } from "./LayaMark";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "./LocaleProvider";

export function Sidebar({
  name,
  org,
  role,
  initialCollapsed = false,
}: {
  name: string;
  org: string;
  role: Role;
  initialCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [narrow, setNarrow] = useState(false);
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

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 63.99rem)");
    const apply = () => {
      const isNarrow = mq.matches;
      setNarrow(isNarrow);
      if (isNarrow) setCollapsed(true);
      else setCollapsed(document.cookie.includes("laya_sidebar=collapsed") || initialCollapsed);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [initialCollapsed]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = [
    { href: "/home", label: t("nav.home"), icon: HomeIcon },
    { href: "/playground", label: t("nav.playground"), icon: FlaskIcon },
    { href: "/usage", label: t("nav.usage"), icon: ChartIcon },
    ...(role === "admin" ? [{ href: "/audit", label: t("nav.audit"), icon: AuditIcon }] : []),
    { href: "/keys", label: t("nav.keys"), icon: KeyIcon },
    { href: "/billing", label: t("nav.billing"), icon: BillingIcon },
    { href: "/org", label: t("nav.org"), icon: OrgIcon },
    { href: "/docs", label: t("nav.docs"), icon: BookIcon },
    { href: "/settings", label: t("nav.settings"), icon: SettingsIcon },
    ...(role === "admin" ? [{ href: "/admin", label: t("nav.team"), icon: TeamIcon }] : []),
  ];

  function toggleCollapsed() {
    if (narrow) return;
    setCollapsed((value) => {
      const next = !value;
      document.cookie = `laya_sidebar=${next ? "collapsed" : "expanded"}; Path=/; Max-Age=31536000; SameSite=Lax`;
      return next;
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navLinks = (
    <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto px-2 pt-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            onClick={() => setDrawerOpen(false)}
            className={`flex items-center gap-2.5 rounded-lg py-2 text-sm transition duration-150 ${
              collapsed && !narrow ? "justify-center px-2" : "px-3"
            } ${
              active
                ? "bg-neutral-100 font-medium text-neutral-950 shadow-sm"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
            }`}
          >
            <Icon />
            {(!collapsed || narrow) && item.label}
          </Link>
        );
      })}
    </nav>
  );

  if (narrow) {
    return (
      <>
        <header className="flex h-12 w-full shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-3 lg:hidden">
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 text-neutral-700"
            aria-expanded={drawerOpen}
            aria-label={drawerOpen ? t("common.collapseSidebar") : t("common.expandSidebar")}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            ☰
          </button>
          <LayaMark className="h-5 w-5 text-neutral-950" />
          <span className="text-[12px] font-semibold tracking-[0.14em] text-neutral-950">LAYA</span>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
          </div>
        </header>
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onMouseDown={() => setDrawerOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <aside
              className="absolute bottom-0 left-0 top-0 flex w-[232px] flex-col border-r border-neutral-200 bg-white shadow-xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 px-4 pb-2 pt-5">
                <LayaMark className="h-6 w-6 text-neutral-950" />
                <span className="text-[13px] font-semibold tracking-[0.16em]">LAYA</span>
              </div>
              {navLinks}
              <div className="border-t border-neutral-200 p-3" ref={menuRef}>
                <p className="px-2 text-sm font-medium">{name}</p>
                <p className="px-2 text-xs text-neutral-500">{org}</p>
                <button type="button" onClick={logout} className="mt-2 w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50">
                  {t("common.signOut")}
                </button>
              </div>
            </aside>
          </div>
        )}
      </>
    );
  }

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-[72px]" : "w-[232px]"
      }`}
    >
      <div className={`flex items-center gap-2.5 pb-2 pt-5 ${collapsed ? "justify-center px-2" : "px-4"}`}>
        <LayaMark className="h-6 w-6 shrink-0 text-neutral-950" />
        {!collapsed && <span className="text-[13px] font-semibold tracking-[0.16em] text-neutral-950">LAYA</span>}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
          className={`grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 ${collapsed ? "" : "ml-auto"}`}
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      {navLinks}
      {!collapsed && (
        <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      )}
      <div className="relative border-t border-neutral-200 p-3" ref={menuRef}>
        {open && (
          <div className={`fade-in absolute z-20 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg ${collapsed ? "bottom-3 left-full ml-2 w-48" : "bottom-16 left-3 right-3"}`}>
            <p className="px-3 py-2 text-xs text-neutral-500">
              {role === "admin" ? t("common.admin") : t("common.member")}
            </p>
            <Link href="/settings" className="block rounded-lg px-3 py-2 text-sm text-neutral-800 transition hover:bg-neutral-50" onClick={() => setOpen(false)}>
              {t("nav.settings")}
            </Link>
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
          aria-label={name}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-neutral-50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-semibold text-white">
            {initials}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-neutral-950">{name}</span>
              <span className="block truncate text-xs text-neutral-500">{org}</span>
            </span>
          )}
          {!collapsed && <Chevron />}
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
function BillingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
function OrgIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
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
