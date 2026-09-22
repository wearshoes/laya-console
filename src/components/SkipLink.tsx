"use client";

import { useI18n } from "./LocaleProvider";

export function SkipLink() {
  const { t } = useI18n();
  return (
    <a href="#main" className="skip-link">
      {t("common.skip")}
    </a>
  );
}
