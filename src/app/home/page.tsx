"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { copyText } from "@/lib/copy-text";
import { LAYA_AGENT_INSTALL_PROMPT } from "@/lib/prompts";

export default function HomePage() {
  const { t } = useI18n();
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  async function copyPrompt() {
    const ok = await copyText(LAYA_AGENT_INSTALL_PROMPT);
    setCopied(ok ? "ok" : "fail");
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto bg-white">
      <section className="grid border-b border-neutral-200 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <div className="flex min-h-[280px] flex-col justify-between px-8 py-8 lg:px-10 lg:py-10">
          <div>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
            >
              <Compass />
              {t("home.viewExamples")}
            </Link>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.92] tracking-[-0.045em] text-neutral-950 sm:text-6xl">
              <span className="block">{t("home.learn1")}</span>
              <span className="block">{t("home.learn2")}</span>
            </h1>
          </div>
          <div className="mt-8 flex items-end justify-between gap-6">
            <Link href="/playground" className="btn-black h-11 gap-2 px-5 text-sm">
              {t("home.cta")} <span aria-hidden>→</span>
            </Link>
            <p className="text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-neutral-400">
              {t("home.v1")}
              <br />
              {t("home.v2")}
              <br />
              {t("home.v3")}
            </p>
          </div>
        </div>
        <HeroArt
          triage={t("home.triage")}
          guard={t("home.guard")}
          triageQ={t("home.triageQ")}
          guardQ={t("home.guardQ")}
        />
      </section>

      <section className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-b border-neutral-200 px-8 py-8 lg:border-b-0 lg:border-r lg:px-10">
          <h2 className="text-[28px] font-semibold tracking-tight">{t("home.inAction")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <article>
              <h3 className="text-sm font-semibold">{t("home.parallelTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t("home.parallelBody")}</p>
            </article>
            <article>
              <h3 className="text-sm font-semibold">{t("home.cascadeTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t("home.cascadeBody")}</p>
            </article>
            <article className="card card-hover overflow-hidden">
              <div className="h-24 bg-[radial-gradient(circle_at_30%_20%,#d7fff1,transparent_45%),radial-gradient(circle_at_80%_0%,#d9e4ff,transparent_40%),linear-gradient(160deg,#f7f7f8,#fff)]" />
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  {t("home.cardKicker")}
                </p>
                <h3 className="mt-1 text-sm font-semibold">{t("home.cardTitle")}</h3>
                <p className="mt-1 text-xs text-neutral-500">{t("home.cardBody")}</p>
              </div>
            </article>
          </div>
        </div>

        <aside className="px-6 py-8">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[28px] font-semibold tracking-tight">{t("home.quickstart")}</h2>
            <Link href="/docs" className="pt-2 text-sm text-[#2f6fed] transition hover:underline">
              {t("home.agentSetup")} ↗
            </Link>
          </div>
          <button type="button" onClick={copyPrompt} className="btn-black mt-5 w-full gap-2">
            <CopyIcon />
            {copied === "ok" ? t("common.copied") : copied === "fail" ? t("common.copyFailed") : t("home.copyPrompt")}
          </button>
          <Link
            href="/docs"
            className="mt-4 flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-3 text-sm shadow-sm transition hover:border-neutral-300 hover:shadow"
          >
            <span className="font-medium text-[#2f6fed]">{t("home.skill")}</span>
            <span className="text-[#2f6fed]">{t("home.view")}</span>
          </Link>
          <a
            href="https://laya.wearglass.work/health"
            className="mt-2 flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-3 text-sm shadow-sm transition hover:border-neutral-300 hover:shadow"
            target="_blank"
            rel="noreferrer"
          >
            <span className="font-mono text-xs text-neutral-700">{t("home.apiHost")}</span>
            <span className="text-[#2f6fed]">{t("home.view")}</span>
          </a>
        </aside>
      </section>

      <footer className="grid border-t border-neutral-200 sm:grid-cols-2 lg:grid-cols-6">
        <FooterLink href="/legal/privacy" label={t("home.dataPolicy")} icon="shield" />
        <FooterLink href="/legal/trust" label={t("home.trust")} icon="shield" />
        <FooterLink href="/docs" label={t("home.docs")} icon="book" />
        <FooterLink href="/docs/api" label={t("home.apiRef")} icon="book" />
        <FooterLink href="/keys" label={t("home.apiKey")} icon="key" />
        <Link href="/docs" className="btn-blue m-3 h-12">
          {t("home.help")}
        </Link>
      </footer>
    </div>
  );
}

function FooterLink({ href, label, icon }: { href: string; label: string; icon: "shield" | "book" | "key" }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 border-b border-neutral-200 px-3 py-5 text-sm text-neutral-700 transition hover:bg-neutral-50 lg:border-b-0 lg:border-r"
    >
      {icon === "shield" ? <Shield /> : icon === "book" ? <Book /> : <Key />}
      {label}
    </Link>
  );
}

function HeroArt({
  triage,
  guard,
  triageQ,
  guardQ,
}: {
  triage: string;
  guard: string;
  triageQ: string;
  guardQ: string;
}) {
  return (
    <div className="relative min-h-[260px] overflow-hidden border-t border-neutral-200 bg-[#f6f7f8] lg:border-l lg:border-t-0">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(#d4d4d4 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      <article className="card absolute left-[8%] top-[16%] w-[48%] -rotate-6 p-4">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-neutral-400">{triage}</p>
        <div className="mt-3 h-16 rounded-xl bg-[conic-gradient(from_120deg,#c4b5fd,#99f6e4,#fde68a,#c4b5fd)] opacity-90" />
        <p className="mt-3 text-sm font-medium">{triageQ}</p>
      </article>
      <article className="card absolute right-[7%] top-[30%] w-[50%] rotate-3 p-4 shadow-md">
        <p className="text-[10px] font-semibold tracking-[0.16em] text-neutral-400">{guard}</p>
        <div className="mt-3 h-16 rounded-xl bg-[radial-gradient(circle_at_30%_40%,#fff,transparent_40%),linear-gradient(135deg,#bfdbfe,#e9d5ff_50%,#bbf7d0)]" />
        <p className="mt-3 text-sm font-medium">{guardQ}</p>
      </article>
    </div>
  );
}

function Compass() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-1.2 5-5 1.2 1.2-5 5-1.2z" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}
function Shield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3z" />
    </svg>
  );
}
function Book() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5z" />
    </svg>
  );
}
function Key() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="8" cy="15" r="3" />
      <path d="M11 13.2 20 4.5" />
    </svg>
  );
}
