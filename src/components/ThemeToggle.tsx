"use client";

import { useEffect, useState } from "react";
import { readTheme, toggleTheme, type Theme } from "@/lib/theme";
import { useI18n } from "./LocaleProvider";

export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => setTheme(readTheme()), []);

  return (
    <button
      type="button"
      className="inline-flex h-8 items-center rounded-full border border-neutral-200 px-3 text-xs text-neutral-700 transition hover:bg-neutral-50"
      aria-pressed={theme === "dark"}
      onClick={() => setTheme(toggleTheme())}
      onFocus={() => setTheme(readTheme())}
    >
      {theme === "dark" ? t("common.themeDark") : t("common.themeLight")}
    </button>
  );
}
