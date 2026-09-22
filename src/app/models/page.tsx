"use client";

import Link from "next/link";
import { DOC_PAGES, tx } from "@/lib/catalog";
import { useI18n } from "@/components/LocaleProvider";

export default function ModelsPage() {
  const { t, locale } = useI18n();
  const page = DOC_PAGES.find((item) => item.id === "models");
  return (
    <div className="h-full overflow-auto px-6 py-8 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("product.modelsTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{t("product.modelsLede")}</p>
      <article className="card mt-6 max-w-2xl p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-neutral-400">{t("product.runtime")}</p>
        <h2 className="mt-2 text-2xl font-semibold">laya-latest</h2>
        {page?.blocks.map((block) => (
          <section key={tx(block.h, "en")} className="mt-4">
            <h3 className="text-sm font-semibold">{tx(block.h, locale)}</h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{tx(block.p, locale)}</p>
          </section>
        ))}
        <Link href="/docs/models" className="mt-4 inline-block text-sm text-[#2f6fed]">
          {t("nav.docs")}
        </Link>
      </article>
    </div>
  );
}
