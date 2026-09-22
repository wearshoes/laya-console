"use client";

import Link from "next/link";
import { useI18n } from "@/components/LocaleProvider";

export default function ForbiddenPage() {
  const { t } = useI18n();
  return (
    <div className="grid min-h-screen place-items-center bg-white px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium tracking-wide text-neutral-400">{t("forbidden.code")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("forbidden.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{t("forbidden.body")}</p>
        <Link href="/home" className="btn-black mt-6 px-5">
          {t("common.backHome")}
        </Link>
      </div>
    </div>
  );
}
