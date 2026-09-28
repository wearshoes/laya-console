"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/components/LocaleProvider";
import styles from "../console-page.module.css";
import modalStyles from "./settings.module.css";

export default function SettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return;
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setOrg(data.user.org || "");
        setRole(data.user.role || "");
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(t("errors.generic"));
      return;
    }
    setName(data.user.name);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.dialog} role="dialog" aria-modal="true" aria-label={t("settings.title")}>
        <aside className={modalStyles.nav}>
          <div className={modalStyles.navTitle}><span>×</span>{t("nav.settings")}</div>
          <Link className={modalStyles.navActive} href="/settings">{t("nav.settings")}</Link>
          <Link href="/org">{t("nav.org")}</Link>
          <Link href="/admin">{t("nav.team")}</Link>
          <Link href="/shares">Shares</Link>
          <Link href="/billing">{t("nav.billing")}</Link>
        </aside>
        <main className={modalStyles.content}>
          <div className={modalStyles.contentHead}>
            <h1>{t("settings.title")}</h1>
            <Link href="/home" aria-label="Close settings">×</Link>
          </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <form onSubmit={onSubmit} className={`${styles.panel} ${styles.panelPad} ${styles.stack}`}>
        <label className={styles.fieldLabel}>
          {t("settings.name")}
          <input value={name} onChange={(e) => setName(e.target.value)} required className="field mt-1" />
        </label>
        <label className={styles.fieldLabel}>
          {t("settings.email")}
          <input value={email} readOnly className="field mt-1 text-neutral-500" />
        </label>
        <p className="text-sm text-neutral-600">
          {org} · {role === "admin" ? t("common.admin") : t("common.member")}
        </p>
        <div>
          <button type="submit" className="btn-black h-10 px-4 text-sm">
            {saved ? t("settings.saved") : t("settings.save")}
          </button>
        </div>
      </form>

      <section className={`${styles.panel} ${styles.panelPad} ${styles.stack}`} style={{ marginTop: "1rem" }}>
        <div>
          <h2 className={styles.sectionTitle}>{t("common.theme")}</h2>
          <p className={styles.muted}>{t("settings.themeLede")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </section>
        </main>
      </div>
    </div>
  );
}
