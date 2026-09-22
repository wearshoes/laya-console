"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LayaMark } from "@/components/LayaMark";
import { useI18n } from "@/components/LocaleProvider";

export default function PrivacyPage() {
  const { t } = useI18n();
  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <LayaMark className="h-8 w-8" />
        <LanguageSwitcher />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">{t("legal.privacyTitle")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">{t("legal.privacyBody")}</p>
      <Link href="/login" className="mt-8 inline-block text-sm text-[#2f6fed] hover:underline">
        {t("legal.back")}
      </Link>
    </main>
  );
}
