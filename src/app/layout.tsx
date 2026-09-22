import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LocaleProvider } from "@/components/LocaleProvider";
import { resolveLocale } from "@/lib/i18n";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const locale = resolveLocale(jar.get("laya_lang")?.value, null);
  return {
    title: locale === "zh-CN" ? "Laya 控制台" : "Laya Console",
    description:
      locale === "zh-CN"
        ? "Wearglass Laya 控制台：类型化决策、API 密钥、用量与审计。"
        : "Wearglass Laya console for typed decisions, API keys, usage, and audit.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const headerList = await headers();
  const locale = resolveLocale(jar.get("laya_lang")?.value, headerList.get("accept-language"));
  return (
    <html lang={locale === "zh-CN" ? "zh-CN" : "en"}>
      <body>
        <LocaleProvider initial={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
