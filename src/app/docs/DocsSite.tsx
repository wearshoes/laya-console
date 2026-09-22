"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LayaMark } from "@/components/LayaMark";
import { useI18n } from "@/components/LocaleProvider";
import { copyText } from "@/lib/copy-text";
import {
  DOCS_UI,
  NAV,
  anchor,
  getDoc,
  groupFor,
  neighbors,
  pageHref,
  pageMarkdown,
  resolveSlug,
  searchDocs,
  tx,
  type Block,
  type DocEntry,
} from "@/lib/docs-site";
import styles from "./docs-site.module.css";

export function DocsChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const slug = pathname === "/docs" ? "" : pathname.replace(/^\/docs\/?/, "");
  const canonical = resolveSlug(slug);
  const results = useMemo(() => (searchOpen ? searchDocs(query, locale) : []), [searchOpen, query, locale]);

  useEffect(() => {
    const stored = window.localStorage.getItem("laya_docs_theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function toggleTheme() {
    setTheme((value) => {
      const next = value === "dark" ? "light" : "dark";
      window.localStorage.setItem("laya_docs_theme", next);
      return next;
    });
  }

  function go(index: number) {
    const page = results[index];
    if (!page) return;
    setSearchOpen(false);
    setQuery("");
    router.push(pageHref(page.slug));
  }

  return (
    <div className={styles.site} data-theme={theme}>
      <header className={styles.header}>
        <button type="button" className={styles.menuBtn} aria-label={tx(DOCS_UI.menu, locale)} onClick={() => setOpen((value) => !value)}>
          ☰
        </button>
        <Link href="/docs" className={styles.brand}>
          <LayaMark className="h-5 w-5" />
          LAYA
        </Link>
        <button type="button" className={styles.searchBtn} onClick={() => setSearchOpen(true)}>
          <span>{tx(DOCS_UI.search, locale)}</span>
          <kbd className={styles.kbd}>Ctrl K</kbd>
        </button>
        <div className={styles.headerActions}>
          <div className={styles.lang} role="group">
            <button type="button" data-active={locale === "en"} onClick={() => setLocale("en")}>
              EN
            </button>
            <button type="button" data-active={locale === "zh-CN"} onClick={() => setLocale("zh-CN")}>
              中文
            </button>
          </div>
          <button type="button" className={styles.iconBtn} aria-label={tx(DOCS_UI.theme, locale)} onClick={toggleTheme}>
            {theme === "dark" ? "☾" : "☀"}
          </button>
          <Link href="/home" className={styles.consoleBtn}>
            {tx(DOCS_UI.console, locale)}
          </Link>
        </div>
      </header>
      <div className={styles.body}>
        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label={tx(DOCS_UI.searchLabel, locale)}>
          {NAV.map((group) => (
            <div key={tx(group.label, "en")}>
              <p className={styles.groupLabel}>{tx(group.label, locale)}</p>
              {group.slugs.map((item) => {
                const page = getDoc(item);
                if (!page) return null;
                const href = pageHref(item);
                const current = canonical === item;
                const nested = group.slugs.some((other) => other && item.startsWith(`${other}/`));
                return (
                  <Link
                    key={item || "home"}
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={`${styles.navLink} ${nested ? styles.child : ""} ${current ? styles.navLinkActive : ""}`}
                  >
                    {tx(page.title, locale)}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className={styles.main}>{children}</div>
      </div>
      {searchOpen && (
        <div className={styles.modal} role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-label={tx(DOCS_UI.searchLabel, locale)}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <input
              autoFocus
              value={query}
              placeholder={tx(DOCS_UI.search, locale)}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((value) => Math.min(results.length - 1, value + 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((value) => Math.max(0, value - 1));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  go(active);
                }
              }}
            />
            {query && results.length === 0 && <p className={styles.empty}>{tx(DOCS_UI.noResults, locale)}</p>}
            {results.map((page, index) => (
              <button
                key={page.slug || "home"}
                type="button"
                className={`${styles.result} ${index === active ? styles.resultActive : ""}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(index)}
              >
                {tx(page.title, locale)}
                <small>{tx(groupFor(page.slug)?.label || DOCS_UI.searchLabel, locale)}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DocsArticle({ slug }: { slug: string }) {
  const { locale } = useI18n();
  const page = getDoc(slug);
  const [copied, setCopied] = useState(false);
  if (!page) {
    return (
      <article className={styles.article}>
        <h1 className={styles.title}>{tx(DOCS_UI.notFoundTitle, locale)}</h1>
        <p className={styles.lede}>{tx(DOCS_UI.notFound, locale)}</p>
      </article>
    );
  }
  const group = groupFor(page.slug);
  const { prev, next } = neighbors(page.slug);
  const headings = page.blocks.filter((block): block is Extract<Block, { type: "h2" }> => block.type === "h2");

  async function copyPage() {
    const ok = await copyText(pageMarkdown(page as DocEntry, locale));
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <>
      <article className={styles.article}>
        <p className={styles.kicker}>{group ? tx(group.label, locale) : "LAYA"}</p>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{tx(page.title, locale)}</h1>
          <button type="button" className={styles.copyBtn} onClick={copyPage}>
            {copied ? tx(DOCS_UI.copied, locale) : tx(DOCS_UI.copyPage, locale)}
          </button>
        </div>
        <p className={styles.lede}>{tx(page.lede, locale)}</p>
        <div className={styles.prose}>
          {page.blocks.map((block, index) => (
            <BlockView key={index} block={block} locale={locale} />
          ))}
        </div>
        <nav className={styles.pager} aria-label="pagination">
          {prev ? (
            <Link href={pageHref(prev.slug)}>
              <div className={styles.pagerLabel}>{tx(DOCS_UI.prev, locale)}</div>
              <div className={styles.pagerTitle}>{tx(prev.title, locale)}</div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={pageHref(next.slug)} className={styles.pagerNext}>
              <div className={styles.pagerLabel}>{tx(DOCS_UI.next, locale)}</div>
              <div className={styles.pagerTitle}>{tx(next.title, locale)}</div>
            </Link>
          ) : null}
        </nav>
      </article>
      {headings.length > 0 && (
        <aside className={styles.toc} aria-label={tx(DOCS_UI.onThisPage, locale)}>
          <p className={styles.tocLabel}>{tx(DOCS_UI.onThisPage, locale)}</p>
          {headings.map((heading) => {
            const label = tx(heading.text, locale);
            return (
              <a key={label} href={`#${anchor(label)}`}>
                {label}
              </a>
            );
          })}
        </aside>
      )}
    </>
  );
}

function BlockView({ block, locale }: { block: Block; locale: "en" | "zh-CN" }) {
  if (block.type === "h2") {
    const label = tx(block.text, locale);
    return <h2 id={anchor(label)}>{label}</h2>;
  }
  if (block.type === "h3") return <h3>{tx(block.text, locale)}</h3>;
  if (block.type === "p") return <p><Rich text={tx(block.text, locale)} /></p>;
  if (block.type === "ul") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={tx(item, "en")}>
            <Rich text={tx(item, locale)} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "code") {
    return (
      <div className={styles.preWrap}>
        <pre className={styles.pre}>{block.code}</pre>
      </div>
    );
  }
  if (block.type === "callout") {
    return (
      <div className={`${styles.callout} ${block.tone === "note" ? styles.calloutNote : ""}`}>
        <span aria-hidden>{block.tone === "note" ? "!" : "i"}</span>
        <p><Rich text={tx(block.text, locale)} /></p>
      </div>
    );
  }
  if (block.type === "table") {
    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {block.headers.map((header) => (
                <th key={tx(header, "en")}>{tx(header, locale)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    <Rich text={tx(cell, locale)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className={styles.flow}>
      {block.steps.map((step, index) => (
        <span key={tx(step, "en")} style={{ display: "contents" }}>
          {index > 0 && <span className={styles.flowArrow}>→</span>}
          <span className={styles.flowStep} data-mid={index === 2 ? "true" : undefined}>
            {tx(step, locale)}
          </span>
        </span>
      ))}
    </div>
  );
}

function Rich({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[3]) {
      parts.push(
        <code key={match.index} className={styles.inlineCode}>
          {match[3]}
        </code>
      );
    } else {
      const href = match[2];
      const external = /^https?:/.test(href);
      parts.push(
        external ? (
          <a key={match.index} href={href} target="_blank" rel="noreferrer">
            {match[1]}
          </a>
        ) : (
          <Link key={match.index} href={href}>
            {match[1]}
          </Link>
        )
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
