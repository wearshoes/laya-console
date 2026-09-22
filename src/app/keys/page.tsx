"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { useI18n } from "@/components/LocaleProvider";
import { copyText } from "@/lib/copy-text";
import styles from "../console-page.module.css";

type KeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  revoked: number;
  created_at: string;
};

export default function KeysPage() {
  const { t, locale } = useI18n();
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [creator, setCreator] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ secret: string; name: string } | null>(null);
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [sort, setSort] = useState<{ key: "name" | "created"; dir: "asc" | "desc" }>({
    key: "created",
    dir: "desc",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generic");
      setKeys(data.keys || []);
      setCreator(data.creator || "");
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "generic");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "default" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generic");
      setRevealed({ secret: data.key.secret, name: data.key.name });
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "generic");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "not_found");
      return;
    }
    setMenu(null);
    setConfirmId(null);
    await load();
  }

  const filtered = keys
    .filter((k) => k.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "name") return a.name.localeCompare(b.name) * dir;
      return a.created_at.localeCompare(b.created_at) * dir;
    });

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <div className={styles.titleRow}>
            <KeyIcon />
            <h1 className={styles.title}>{t("keys.title")}</h1>
          </div>
          <p className={styles.hint}>{t("keys.own")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRevealed(null);
            setModal(true);
          }}
          className="btn-black h-9 gap-1.5 px-3 text-sm"
        >
          + {t("keys.create")}
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("keys.search")}
        className={`${styles.input} ${styles.search}`}
      />
      {error && <p className="mt-3 text-sm text-red-600">{t(`errors.${error}`)}</p>}

      <div className={styles.panel}>
        <table className={styles.table}>
          <thead>
            <tr>
              <Th label={t("keys.name")} onClick={() => toggle("name")} />
              <th>{t("keys.status")}</th>
              <th>{t("keys.secret")}</th>
              <th>{t("keys.createdBy")}</th>
              <Th label={t("keys.created")} onClick={() => toggle("created")} />
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-neutral-500">
                  {t("common.loading")}
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-neutral-500">
                  {t("keys.empty")}
                </td>
              </tr>
            )}
            {filtered.map((k) => (
              <tr key={k.id}>
                <td className="font-medium">{k.name}</td>
                <td>
                  <span className={k.revoked ? styles.badgeMuted : styles.badgeOk}>
                    {k.revoked ? t("keys.revoked") : t("keys.active")}
                  </span>
                </td>
                <td>
                  <span className={styles.mono}>{k.key_prefix}…</span>
                </td>
                <td className="text-neutral-600">{creator}</td>
                <td className="text-neutral-600">{formatDate(k.created_at, locale)}</td>
                <td className="relative text-right">
                  {!k.revoked && (
                    <>
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-neutral-500 hover:bg-neutral-100"
                        onClick={() => setMenu(menu === k.id ? null : k.id)}
                      >
                        ···
                      </button>
                      {menu === k.id && (
                        <div className="absolute right-4 top-10 z-10 w-40 rounded-lg border border-neutral-200 bg-white p-1 text-left shadow-lg">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmId(k.id);
                              setMenu(null);
                            }}
                            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            {t("keys.revoke")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.footerNote}>{t("keys.footer")}</p>

      {confirmId && (
        <Modal title={t("keys.revokeConfirm")} onClose={() => setConfirmId(null)}>
          <p className="mt-2 text-sm text-neutral-600">
            {keys.find((k) => k.id === confirmId)?.name}. {t("keys.revokeBody")}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-md border border-neutral-200 px-3 py-2 text-sm" onClick={() => setConfirmId(null)}>
              {t("common.cancel")}
            </button>
            <button type="button" className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white" onClick={() => revoke(confirmId)}>
              {t("keys.revoke")}
            </button>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal
          title={revealed ? t("keys.revealTitle") : t("keys.modalTitle")}
          onClose={() => {
            setModal(false);
            setRevealed(null);
          }}
        >
          {revealed ? (
            <div className="mt-3">
              <p className="text-sm text-neutral-600">{t("keys.revealBody")}</p>
              <code className="mt-3 block break-all rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-xs">
                {revealed.secret}
              </code>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  onClick={async () => {
                    const ok = await copyText(revealed.secret);
                    setCopiedSecret(ok);
                  }}
                >
                  {copiedSecret ? t("common.copied") : t("common.copy")}
                </button>
                <button
                  type="button"
                  className="btn-black h-10 px-3 text-sm"
                  onClick={() => {
                    setModal(false);
                    setRevealed(null);
                  }}
                >
                  {t("keys.saved")}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onCreate} className="mt-3">
              <p className="text-sm leading-relaxed text-neutral-600">{t("keys.modalBody")}</p>
              <label className="mt-4 block text-sm font-medium" htmlFor="key-name">
                {t("keys.keyName")}
              </label>
              <input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("keys.placeholder")}
                className="field mt-1.5"
                autoFocus
              />
              <div className="mt-5 flex justify-end">
                <button type="submit" disabled={creating} className="btn-black h-10 px-4 text-sm">
                  {creating ? t("common.loading") : t("keys.create")}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );

  function toggle(key: "name" | "created") {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  }
}

function Th({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th>
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1">
        {label}
        <span className="text-[10px] text-neutral-400">↕</span>
      </button>
    </th>
  );
}

function formatDate(iso: string, locale: string) {
  const normalized = iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="8" cy="15" r="3.2" />
      <path d="M11 13.2 20 4.5" />
    </svg>
  );
}
