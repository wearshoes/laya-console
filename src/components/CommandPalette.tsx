"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/users";
import { toggleTheme } from "@/lib/theme";
import { useI18n } from "./LocaleProvider";

type Command = { id: string; label: string; run: () => void };

export function CommandPalette({ role }: { role: Role }) {
  const { t, setLocale } = useI18n();
  const router = useRouter();
  const titleId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      setOpen(false);
      router.push(href);
    };
    const items: Command[] = [
      { id: "home", label: t("nav.home"), run: go("/home") },
      { id: "playground", label: t("nav.playground"), run: go("/playground") },
      { id: "usage", label: t("nav.usage"), run: go("/usage") },
      { id: "keys", label: t("nav.keys"), run: go("/keys") },
      { id: "billing", label: t("nav.billing"), run: go("/billing") },
      { id: "org", label: t("nav.org"), run: go("/org") },
      { id: "shares", label: t("nav.shares"), run: go("/shares") },
      { id: "models", label: t("nav.models"), run: go("/models") },
      { id: "docs", label: t("nav.docs"), run: go("/docs") },
      { id: "settings", label: t("nav.settings"), run: go("/settings") },
    ];
    if (role === "admin") {
      items.push({ id: "audit", label: t("nav.audit"), run: go("/audit") });
      items.push({ id: "team", label: t("nav.team"), run: go("/admin") });
    }
    items.push(
      {
        id: "theme",
        label: t("common.theme"),
        run: () => {
          toggleTheme();
          setOpen(false);
        },
      },
      {
        id: "lang-en",
        label: `${t("common.language")}: EN`,
        run: () => {
          setLocale("en");
          setOpen(false);
        },
      },
      {
        id: "lang-zh",
        label: `${t("common.language")}: 中文`,
        run: () => {
          setLocale("zh-CN");
          setOpen(false);
        },
      },
      {
        id: "feedback",
        label: t("product.feedback"),
        run: () => {
          setOpen(false);
          window.dispatchEvent(new Event("laya-open-feedback"));
        },
      },
      {
        id: "signout",
        label: t("common.signOut"),
        run: async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          setOpen(false);
          router.push("/login");
          router.refresh();
        },
      }
    );
    return items;
  }, [role, router, setLocale, t]);

  const filtered = commands.filter((command) => command.label.toLowerCase().includes(query.trim().toLowerCase()));
  const current = filtered[Math.min(active, Math.max(filtered.length - 1, 0))];
  const filteredRef = useRef(filtered);
  const currentRef = useRef(current);
  filteredRef.current = filtered;
  currentRef.current = current;

  useEffect(() => {
    function onOpen() {
      setQuery("");
      setActive(0);
      setOpen(true);
    }
    window.addEventListener("laya-open-commands", onOpen);
    return () => window.removeEventListener("laya-open-commands", onOpen);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setActive(0);
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      const list = filteredRef.current;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((index) => (list.length ? (index + 1) % list.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((index) => (list.length ? (index - 1 + list.length) % list.length : 0));
      } else if (e.key === "Enter" && currentRef.current) {
        e.preventDefault();
        currentRef.current.run();
      } else if (e.key === "Tab" && dialogRef.current) {
        const items = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>("input, button, [href]")
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-pop w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          {t("common.commands")}
        </h2>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          placeholder={t("product.palettePlaceholder")}
          className="h-12 w-full border-b border-neutral-200 bg-transparent px-4 text-sm outline-none"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={current ? `cmd-${current.id}` : undefined}
          aria-autocomplete="list"
        />
        <ul id={listId} role="listbox" className="max-h-80 overflow-auto p-2">
          {filtered.length === 0 && <li className="px-3 py-4 text-sm text-neutral-500">{t("product.paletteEmpty")}</li>}
          {filtered.map((command, index) => (
            <li key={command.id} role="presentation">
              <button
                id={`cmd-${command.id}`}
                type="button"
                role="option"
                aria-selected={index === active}
                className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                  index === active ? "bg-neutral-100 font-medium" : "hover:bg-neutral-50"
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => command.run()}
              >
                {command.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
