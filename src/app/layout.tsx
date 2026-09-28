import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LocaleProvider } from "@/components/LocaleProvider";
import { resolveLocale } from "@/lib/i18n";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const locale = resolveLocale(jar.get("laya_lang")?.value, null);
  return {
    title: "TypeSafe AI",
    description:
      "TypeSafe AI is an AI lab building machine-native intelligence infrastructure for automation, designed to make decisions within software.",
    metadataBase: new URL("https://typesafe.ai"),
    alternates: { canonical: "/" },
    openGraph: {
      title: "TypeSafe AI",
      description: "Machine-native intelligence for automation.",
      url: "https://typesafe.ai/",
      siteName: "TypeSafe AI",
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
