import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LocaleProvider } from "@/components/LocaleProvider";
import { resolveLocale } from "@/lib/i18n";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const locale = resolveLocale(jar.get("laya_lang")?.value, null);
  return {
    title: "Laya Console",
    description: "Laya Console for typed decisions, API keys, usage, and audit.",
    metadataBase: new URL("https://laya.wearglass.work"),
    alternates: { canonical: "/" },
    openGraph: {
      title: "Laya Console",
      description: "Typed decisions, API keys, usage, and audit for Laya.",
      url: "https://laya.wearglass.work/",
      siteName: "Laya Console",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const headerList = await headers();
  const locale = resolveLocale(jar.get("laya_lang")?.value, headerList.get("accept-language"));
  const theme = jar.get("laya_theme")?.value === "dark" ? "dark" : "light";
  return (
    <html lang={locale === "zh-CN" ? "zh-CN" : "en"} className={theme === "dark" ? "dark" : undefined}>
      <body>
        <LocaleProvider initial={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
