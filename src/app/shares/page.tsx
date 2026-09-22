"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import { PRESET_IDS } from "@/lib/prompts";

type ShareRow = {
  id: string;
  token: string;
  title: string;
  preset: string | null;
  revoked: number;
};

export default function SharesPage() {
  const { t } = useI18n();
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [title, setTitle] = useState("");
  const [preset, setPreset] = useState("triage");
  const [stateText, setStateText] = useState('{"text":"order never arrived"}');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/shares");
    const data = await res.json();
    if (res.ok) setShares(data.shares || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    let state: unknown;
    try {
      state = JSON.parse(stateText);
    } catch {
      setError(t("playground.invalid"));
      return;
    }
    const res = await fetch("/api/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, preset, state }),
    });
    if (!res.ok) {
      setError(t("errors.generic"));
      return;
    }
    setTitle("");
    await load();
  }

  async function revoke(id: string) {
    await fetch(`/api/shares/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="h-full overflow-auto px-6 py-8 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("product.sharesTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{t("product.sharesLede")}</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={onSubmit} className="card mt-6 grid max-w-2xl gap-3 p-5">
        <label className="text-xs text-neutral-500">
          {t("product.shareTitle")}
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="field mt-1" />
        </label>
        <label className="text-xs text-neutral-500">
          {t("playground.select")}
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className="field mt-1">
            {PRESET_IDS.map((id) => (
              <option key={id} value={id}>
                {t(`presets.${id}.label`)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-neutral-500">
          {t("playground.state")}
          <textarea value={stateText} onChange={(e) => setStateText(e.target.value)} className="field mt-1 h-32 py-2 font-mono text-xs" />
        </label>
        <button type="submit" className="btn-black h-10 text-sm">
          {t("product.createShare")}
        </button>
      </form>
      <ul className="mt-6 max-w-2xl divide-y divide-neutral-200">
        {shares.length === 0 && <li className="py-4 text-sm text-neutral-500">{t("product.emptyShares")}</li>}
        {shares.map((share) => (
          <li key={share.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className={`font-medium ${share.revoked ? "text-neutral-400 line-through" : ""}`}>{share.title}</p>
              <p className="text-xs text-neutral-500">{share.preset || "—"}</p>
            </div>
            <div className="flex items-center gap-3">
              {!share.revoked && (
                <Link href={`/s/${share.token}`} className="text-[#2f6fed]">
                  {t("product.open")}
                </Link>
              )}
              {!share.revoked && (
                <button type="button" onClick={() => revoke(share.id)} className="text-neutral-600">
                  {t("product.revoke")}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
