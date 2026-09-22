"use client";

import { useI18n } from "./LocaleProvider";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div
      className={`inline-flex rounded-full border border-neutral-200 bg-white p-0.5 text-xs shadow-sm ${className}`}
      role="group"
      aria-label={t("common.language")}
    >
      {(
        [
          ["en", "EN"],
          ["zh-CN", "中文"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setLocale(id)}
          className={`rounded-full px-2.5 py-1 transition ${
            locale === id ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
