"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useI18n } from "@/components/LocaleProvider";

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
    <div className="h-full overflow-auto px-6 py-8 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("settings.title")}</h1>
      <p className="mt-2 max-w-xl text-sm text-neutral-600">{t("settings.lede")}</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={onSubmit} className="card mt-6 max-w-xl space-y-4 p-5">
        <label className="block text-sm">
          <span className="font-medium">{t("settings.name")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="field mt-1" />
        </label>
        <label className="block text-sm">
          <span className="font-medium">{t("settings.email")}</span>
          <input value={email} readOnly className="field mt-1 text-neutral-500" />
        </label>
        <p className="text-sm text-neutral-600">
          {org} · {role === "admin" ? t("common.admin") : t("common.member")}
        </p>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-black h-10 px-4 text-sm">
            {saved ? t("settings.saved") : t("settings.save")}
          </button>
        </div>
      </form>
      <section className="card mt-4 max-w-xl p-5">
        <h2 className="text-base font-semibold">{t("common.theme")}</h2>
        <p className="mt-1 text-sm text-neutral-600">{t("settings.themeLede")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </section>
    </div>
  );
}
