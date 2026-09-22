"use client";

import Link from "next/link";
import { useI18n } from "./LocaleProvider";

export function DocsSignIn() {
  const { t } = useI18n();
  return (
    <Link href="/login?returnTo=/docs" className="btn-black h-9 px-3 text-sm">
      {t("docs.signIn")}
    </Link>
  );
}
