"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { copyText } from "@/lib/copy-text";
import { HOME_EDITORIAL, tx } from "@/lib/catalog";
import { LAYA_AGENT_INSTALL_PROMPT, SKILL_MD_URL } from "@/lib/prompts";
import { HomeUsageCard } from "@/components/HomeUsageCard";
import styles from "./home.module.css";

export default function HomePage() {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState<"ok" | "fail" | null>(null);

  async function copyPrompt() {
    const ok = await copyText(LAYA_AGENT_INSTALL_PROMPT);
    setCopied(ok ? "ok" : "fail");
    setTimeout(() => setCopied(null), 1600);
  }

  const title = `${t("home.learn1")} ${t("home.learn2")}`;
  const stamp = (
    <p className={styles.modelStamp} aria-hidden>
      {t("home.v1")}
      <br />
      {t("home.v2")}
      <br />
      {t("home.v3")}
    </p>
  );

  return (
    <div className={styles.page}>
      <section className={styles.desktopBanner}>
        <Link href="/playground" className={styles.desktopBannerLink} aria-label={t("home.viewExamples")}>
          <div className={styles.desktopTitleSection}>
            <div className={styles.desktopTitleContent}>
              <div>
                <p className={styles.eyebrow}>
                  <Compass />
                  {t("home.viewExamples")}
                </p>
                <h1 className={styles.title2xl} aria-label={title} style={{ marginTop: "1rem" }}>
                  <span className={styles.titleLine}>{t("home.learn1")}</span>
                  <span className={styles.titleLine}>{t("home.learn2")}</span>
                </h1>
              </div>
              <div className="flex items-end justify-between gap-4">
                <span className={styles.cta}>
                  {t("home.cta")} <span aria-hidden>→</span>
                </span>
                {stamp}
              </div>
            </div>
          </div>
          <div
            className={styles.artwork}
            role="img"
            aria-label={`${t("home.triage")}, ${t("home.guard")}`}
          />
        </Link>
      </section>

      <section className={styles.mobileHero}>
        <p className={styles.eyebrow}>
          <Compass />
          {t("home.viewExamples")}
        </p>
        <h1 className={styles.title2xl} aria-label={title} style={{ marginTop: "0.75rem" }}>
          <span className={styles.titleLine}>{t("home.learn1")}</span>
          <span className={styles.titleLine}>{t("home.learn2")}</span>
        </h1>
        <div className="mt-5 flex items-end justify-between gap-4">
          <Link href="/playground" className={styles.cta}>
            {t("home.cta")} <span aria-hidden>→</span>
          </Link>
          {stamp}
        </div>
        <div className={styles.mobileArt} role="img" aria-hidden />
      </section>

      <div className={styles.lowerGrid}>
        <aside className={styles.rail} aria-label={t("home.quickstart")}>
          <header className={styles.quickstartHeader}>
            <h2 className={styles.titleLg}>{t("home.quickstart")}</h2>
            <Link href="/docs/quickstart" className={styles.linkBlue} aria-label={t("home.agentSetup")}>
              {t("home.agentSetup")} ↗
            </Link>
          </header>

          <section className={styles.agentSetup}>
            <div className={styles.agentBody}>
              <div className={styles.promptFrame}>
                <pre className={styles.promptText}>{LAYA_AGENT_INSTALL_PROMPT}</pre>
                <div className={styles.copyAction}>
                  <button
                    type="button"
                    className={styles.copyButton}
                    aria-label={t("home.copyPrompt")}
                    onClick={copyPrompt}
                  >
                    <CopyIcon />
                    {copied === "ok"
                      ? t("common.copied")
                      : copied === "fail"
                        ? t("common.copyFailed")
                        : t("home.copyPrompt")}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.agentFooter}>
              <a href={SKILL_MD_URL} target="_blank" rel="noreferrer">
                <DocIcon />
                {t("home.skill")}
              </a>
              <Link href="/docs/quickstart">{t("home.view")}</Link>
            </div>
          </section>

          <div className={styles.secondary}>
            <HomeUsageCard />
            <nav className={styles.accountNav} aria-label={t("home.docs")}>
              <Link href="/keys">
                <KeyIcon />
                {t("home.apiKey")}
              </Link>
              <Link href="/docs">
                <BookIcon />
                {t("home.docs")}
              </Link>
            </nav>
          </div>
        </aside>

        <section className={styles.inAction} data-launchpad-showcase-region="true">
          <div className={styles.showcase}>
            <div className={styles.cookbooksCol}>
              <div className={styles.inActionHeader}>
                <h2 className={styles.titleLg}>{t("home.inAction")}</h2>
              </div>
              <section aria-label={tx(HOME_EDITORIAL.cookbooksTitle, locale)}>
                <h3 className={styles.srOnly}>{tx(HOME_EDITORIAL.cookbooksTitle, locale)}</h3>
                <ul className={styles.cookbooks}>
                  {HOME_EDITORIAL.cookbooks.map((item) => (
                    <li key={tx(item.title, "en")} className={styles.cookbookItem}>
                      <Link
                        href="/docs/patterns"
                        className={styles.cookbook}
                        aria-label={`View cookbook: ${tx(item.title, "en")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className={styles.cookbookCopy}>
                          <span className={styles.cookbookTitle}>{tx(item.title, locale)}</span>
                          <span className={styles.cookbookBody}>{tx(item.body, locale)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/docs/patterns" className={styles.allCookbooks} target="_blank" rel="noreferrer">
                  {t("home.allCookbooks")}
                </Link>
              </section>
            </div>
            <div className={styles.demosCol}>
              <section aria-label={tx(HOME_EDITORIAL.demosTitle, locale)}>
                <h3 className={styles.srOnly}>{tx(HOME_EDITORIAL.demosTitle, locale)}</h3>
                <ul className={styles.demos}>
                  {HOME_EDITORIAL.demos.map((item) => (
                    <li key={item.preset} className={styles.demoItem}>
                      <Link
                        href={`/playground?preset=${item.preset}`}
                        className={styles.demo}
                        aria-label={`View demo: ${tx(item.title, "en")}`}
                      >
                        <span className={styles.demoArtRow}>
                          <span className={item.art === "wide" ? styles.demoArtWide : styles.demoArtCompact}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt=""
                              aria-hidden
                              width={item.art === "wide" ? 135.539 : 72.9937}
                              height={item.art === "wide" ? 80 : 76.9948}
                            />
                          </span>
                        </span>
                        <span className={styles.demoBody}>
                          <span className={styles.demoTitle}>{tx(item.title, locale)}</span>
                          <span className={styles.demoSwap}>
                            <span className={styles.demoDesc}>{tx(item.body, locale)}</span>
                            <span className={styles.demoPlay} aria-hidden>
                              {t("home.playDemo")}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </section>

        <nav className={styles.utilities} aria-label={t("home.docs")}>
          <Link href="/legal/privacy">
            <ShieldIcon />
            {t("home.dataPolicy")}
          </Link>
          <Link href="/legal/trust">
            <ShieldIcon />
            {t("home.trust")}
          </Link>
          <Link href="/home">
            <ReplayIcon />
            {t("home.replay")}
          </Link>
          <a href="https://github.com/wearshoes/laya-console" target="_blank" rel="noreferrer">
            <PeopleIcon />
            {t("home.github")}
          </a>
        </nav>
      </div>
    </div>
  );
}

function Compass() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-1.2 5-5 1.2 1.2-5 5-1.2z" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M8 3h7l5 5v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v5h5" />
    </svg>
  );
}
function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="1.7" aria-hidden>
      <circle cx="8" cy="15" r="3" />
      <path d="M11 13.2 20 4.5" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="1.7" aria-hidden>
      <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="1.7" aria-hidden>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3z" />
    </svg>
  );
}
function ReplayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="1.7" aria-hidden>
      <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f6fed" strokeWidth="1.7" aria-hidden>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="10" r="2.2" />
      <path d="M16 19a4.5 4.5 0 0 1 4.5-4" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="1.6" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </svg>
  );
}
