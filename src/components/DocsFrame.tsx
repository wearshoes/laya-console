"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./LocaleProvider";

const LINKS = [
  ["/docs", "quickstart"],
  ["/docs/api", "api"],
  ["/docs/keys", "keys"],
  ["/docs/presets", "presets"],
] as const;

export function DocsFrame({ section }: { section: "quickstart" | "api" | "keys" | "presets" }) {
  const pathname = usePathname();
  const { t, dict } = useI18n();
  const page = dict.docs[section];

  return (
    <div className="flex h-full min-h-0">
      <nav className="hidden w-52 shrink-0 flex-col gap-1 border-r border-neutral-200 p-4 md:flex">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {t("nav.docs")}
        </p>
        {LINKS.map(([href, key]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-neutral-100 font-medium text-neutral-950" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {t(`docs.${key}.title`)}
            </Link>
          );
        })}
      </nav>
      <article className="min-h-0 flex-1 overflow-auto px-6 py-8 md:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">{t("nav.docs")}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{page.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-neutral-600">{page.lede}</p>
        <div className="mt-8 max-w-3xl space-y-8">
          {page.blocks.map((block) => (
            <section key={block.h} className="card p-5">
              <h2 className="text-lg font-semibold">{block.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{block.p}</p>
              {block.code ? (
                <pre className="mt-4 overflow-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-100">
                  {block.code}
                </pre>
              ) : null}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
