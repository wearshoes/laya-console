"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { en, lookup, zhCN, type Dict, type Locale } from "@/lib/i18n";

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dict: Dict;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);
  const dict = locale === "zh-CN" ? zhCN : en;

  const value = useMemo<Ctx>(() => {
    return {
      locale,
      dict,
      t: (key: string) => lookup(dict, key),
      setLocale: (next: Locale) => {
        setLocaleState(next);
        document.cookie = `laya_lang=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
        document.documentElement.lang = next === "zh-CN" ? "zh-CN" : "en";
      },
    };
  }, [locale, dict]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n outside provider");
  return ctx;
}
