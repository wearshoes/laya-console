"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DOC_PAGES, tx, type DocPage } from "@/lib/catalog";
import { useI18n } from "./LocaleProvider";

type Group = "start" | "reference" | "product" | "legal";

/** In-console docs IA aligned to a Jev-style docs shell, Laya content only. */
const ORDER: { group: Group; href: string; id: string; source: "catalog" | "i18n" }[] = [
  { group: "start", href: "/docs", id: "overview", source: "catalog" },
  { group: "start", href: "/docs/quickstart", id: "quickstart", source: "i18n" },
  { group: "start", href: "/docs/patterns", id: "patterns", source: "catalog" },
  { group: "reference", href: "/docs/api", id: "api", source: "i18n" },
  { group: "reference", href: "/docs/presets", id: "presets", source: "i18n" },
  { group: "reference", href: "/docs/keys", id: "keys", source: "i18n" },
  { group: "reference", href: "/docs/authn", id: "authn", source: "catalog" },
  { group: "reference", href: "/docs/errors", id: "errors", source: "catalog" },
  { group: "product", href: "/docs/models", id: "models", source: "catalog" },
  { group: "product", href: "/docs/billing", id: "billing", source: "catalog" },
  { group: "product", href: "/docs/orgs", id: "orgs", source: "catalog" },
  { group: "product", href: "/docs/shares", id: "shares", source: "catalog" },
  { group: "legal", href: "/docs/legal", id: "legal", source: "catalog" },
];

const GROUPS: Group[] = ["start", "reference", "product", "legal"];

function isDocSection(
  value: unknown
): value is { title: string; lede: string; blocks: { h: string; p: string; code: string }[] } {
  return Boolean(value && typeof value === "object" && "title" in value && "blocks" in value);
}

function anchor(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-").replace(/^-|-$/g, "") || "section";
}

export function DocsFrame({ slug }: { slug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, dict, locale } = useI18n();
  const [query, setQuery] = useState("");
  const entry = ORDER.find((item) => item.href === (slug ? `/docs/${slug}` : "/docs"));
  const catalog = entry?.source === "catalog" ? DOC_PAGES.find((page) => page.id === entry.id) : undefined;
  const i18nRaw = entry?.source === "i18n" ? dict.docs[entry.id as keyof typeof dict.docs] : undefined;
  const i18nPage = isDocSection(i18nRaw) ? i18nRaw : undefined;

  const labelFor = (item: (typeof ORDER)[number]) => {
    if (item.source === "i18n") return t(`docs.${item.id}.title`);
    const page = DOC_PAGES.find((doc) => doc.id === item.id);
    return page ? tx(page.title, locale) : item.id;
  };

  const blobFor = (item: (typeof ORDER)[number]) => {
    if (item.source === "catalog") {
      const page = DOC_PAGES.find((doc) => doc.id === item.id);
      if (!page) return labelFor(item);
      return [tx(page.title, locale), tx(page.lede, locale), ...page.blocks.flatMap((block) => [tx(block.h, locale), tx(block.p, locale), block.code || ""])].join("\n");
    }
    const raw = dict.docs[item.id as keyof typeof dict.docs];
    if (!isDocSection(raw)) return labelFor(item);
    return [raw.title, raw.lede, ...raw.blocks.flatMap((block) => [block.h, block.p, block.code])].join("\n");
  };

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => ORDER.filter((item) => !q || blobFor(item).toLowerCase().includes(q)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, locale, dict]
  );

  const headings = catalog
    ? catalog.blocks.map((block) => tx(block.h, locale))
    : i18nPage
      ? i18nPage.blocks.map((block) => block.h)
      : [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-white md:flex-row">
      <div className="border-b border-neutral-200 p-3 md:hidden">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {t("docs.search")}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field mt-2 h-10"
            placeholder={t("docs.search")}
            type="search"
          />
        </label>
        <label className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {t("nav.docs")}
          <select className="field mt-2 h-10" value={pathname} onChange={(e) => router.push(e.target.value)}>
            {visible.map((item) => (
              <option key={item.href} value={item.href}>
                {labelFor(item)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav
        className="hidden w-[15.5rem] shrink-0 flex-col gap-5 overflow-auto border-r border-neutral-200 bg-[#fafafa] px-3 py-5 md:flex"
        aria-label={t("nav.docs")}
      >
        <label className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
          {t("docs.search")}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 h-9 w-full rounded-md border border-neutral-200 bg-white px-2.5 text-sm outline-none focus:border-neutral-400"
            placeholder={t("docs.search")}
            type="search"
          />
        </label>
        {visible.length === 0 && <p className="px-2 text-sm text-neutral-500">{t("docs.noResults")}</p>}
        {GROUPS.map((group) => {
          const items = visible.filter((item) => item.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {t(`product.group${group[0].toUpperCase()}${group.slice(1)}`)}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-md px-2.5 py-1.5 text-sm transition ${
                        active
                          ? "bg-white font-medium text-neutral-950 shadow-sm ring-1 ring-neutral-200"
                          : "text-neutral-600 hover:bg-white/70 hover:text-neutral-950"
                      }`}
                    >
                      {labelFor(item)}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1">
        <article className="min-h-0 flex-1 overflow-auto px-6 py-8 md:px-10 lg:px-12">
          {catalog ? (
            <CatalogBody page={catalog} kicker={t("nav.docs")} />
          ) : i18nPage ? (
            <Prose
              kicker={t("nav.docs")}
              title={i18nPage.title}
              lede={i18nPage.lede}
              blocks={i18nPage.blocks.map((block) => ({
                id: anchor(block.h),
                h: block.h,
                p: block.p,
                code: block.code,
              }))}
            />
          ) : (
            <p className="text-sm text-neutral-600">{t("common.missing")}</p>
          )}
        </article>

        {headings.length > 0 && (
          <aside className="hidden w-48 shrink-0 overflow-auto border-l border-neutral-100 px-4 py-8 xl:block" aria-label={t("docs.onThisPage")}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{t("docs.onThisPage")}</p>
            <ul className="mt-3 space-y-2">
              {headings.map((heading) => (
                <li key={heading}>
                  <a href={`#${anchor(heading)}`} className="block text-xs leading-snug text-neutral-500 hover:text-neutral-900">
                    {heading}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </div>
  );
}

function CatalogBody({ page, kicker }: { page: DocPage; kicker: string }) {
  const { locale } = useI18n();
  return (
    <Prose
      kicker={kicker}
      title={tx(page.title, locale)}
      lede={tx(page.lede, locale)}
      blocks={page.blocks.map((block) => ({
        id: anchor(tx(block.h, locale)),
        h: tx(block.h, locale),
        p: tx(block.p, locale),
        code: block.code || "",
      }))}
    />
  );
}

function Prose({
  kicker,
  title,
  lede,
  blocks,
}: {
  kicker: string;
  title: string;
  lede: string;
  blocks: { id: string; h: string; p: string; code: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">{kicker}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-neutral-950">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">{lede}</p>
      <div className="mt-10 space-y-10">
        {blocks.map((block) => (
          <section key={block.id} id={block.id} className="scroll-mt-8">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">{block.h}</h2>
            <p className="mt-3 text-[15px] leading-7 text-neutral-600">{block.p}</p>
            {block.code ? (
              <pre className="mt-4 overflow-auto rounded-lg border border-neutral-200 bg-neutral-950 p-4 font-mono text-[12px] leading-relaxed text-neutral-100">
                {block.code}
              </pre>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
