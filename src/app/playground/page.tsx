"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JsonEditor } from "@/components/JsonEditor";
import { useI18n } from "@/components/LocaleProvider";
import { copyText } from "@/lib/copy-text";
import { DEFAULT_STATE, PRESET_IDS, PRESET_STATES, type PresetId } from "@/lib/prompts";

type ViewMode = "json" | "plain";

function PlaygroundInner() {
  const { t } = useI18n();
  const [stateText, setStateText] = useState(JSON.stringify(DEFAULT_STATE, null, 2));
  const [preset, setPreset] = useState<PresetId>("triage");
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("json");
  const [stacked, setStacked] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [shared, setShared] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const params = useSearchParams();
  const presetOnce = useRef(false);

  useEffect(() => {
    if (presetOnce.current) return;
    presetOnce.current = true;
    const id = params.get("preset");
    if (id && (PRESET_IDS as readonly string[]).includes(id)) {
      setPreset(id as PresetId);
      setUseCustom(false);
      setStateText(JSON.stringify(PRESET_STATES[id as PresetId], null, 2));
    }
  }, [params]);

  const stateValid = useMemo(() => {
    try {
      JSON.parse(stateText);
      return true;
    } catch {
      return false;
    }
  }, [stateText]);

  const customValid = useMemo(() => {
    if (!useCustom) return true;
    try {
      JSON.parse(custom);
      return true;
    } catch {
      return false;
    }
  }, [custom, useCustom]);

  const questionCount = useMemo(() => {
    if (!useCustom) return 1;
    try {
      const parsed = JSON.parse(custom);
      return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
      return 0;
    }
  }, [custom, useCustom]);

  function applyPreset(id: PresetId) {
    setPreset(id);
    setUseCustom(false);
    setStateText(JSON.stringify(PRESET_STATES[id], null, 2));
  }

  function formatJson() {
    try {
      if (useCustom) setCustom(JSON.stringify(JSON.parse(custom), null, 2));
      else setStateText(JSON.stringify(JSON.parse(stateText), null, 2));
    } catch {
      /* keep invalid text visible */
    }
  }

  function clearAll() {
    applyPreset("triage");
    setCustom("");
    setResponse(null);
    setError(null);
    setShowExamples(true);
  }

  async function share() {
    const parsed = JSON.parse(stateText);
    const body = useCustom
      ? { title: "Custom questions", preset: null, state: { state: parsed, questions: JSON.parse(custom) } }
      : { title: preset, preset, state: parsed };
    const res = await fetch("/api/shares", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.share?.token) {
      setError(t("errors.generic"));
      return;
    }
    const path = `/s/${data.share.token}`;
    setShareUrl(path);
    setShared(await copyText(`${window.location.origin}${path}`));
  }

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const state = JSON.parse(stateText);
      const body: Record<string, unknown> = { state };
      if (useCustom) body.questions = JSON.parse(custom);
      else body.preset = preset;
      const res = await fetch("/api/playground/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) setError(t(`errors.${data?.error || "generic"}`));
      setResponse(data);
      setShowExamples(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  const plain =
    response == null
      ? ""
      : typeof response === "object"
        ? Object.entries(response as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
            .join("\n")
        : String(response);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-3 py-2">
        <Flask />
        <h1 className="mr-1 text-sm font-semibold">{t("playground.title")}</h1>
        <button type="button" onClick={clearAll} className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs transition hover:bg-neutral-50">
          {t("playground.clear")}
        </button>
        <button
          type="button"
          onClick={share}
          disabled={!stateValid || !customValid}
          className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs transition hover:bg-neutral-50 disabled:opacity-40"
        >
          {shared ? t("playground.shared") : t("playground.share")}
        </button>
        {shareUrl ? (
          <Link href={shareUrl} className="max-w-[220px] truncate text-xs text-[#2f6fed]">
            {shareUrl}
          </Link>
        ) : null}
        <div className="ml-auto flex items-center gap-1 rounded-md border border-neutral-200 p-0.5">
          <button
            type="button"
            aria-label="side by side"
            onClick={() => setStacked(false)}
            className={`rounded px-2 py-1 text-xs ${!stacked ? "bg-neutral-100" : ""}`}
          >
            ▯▯
          </button>
          <button
            type="button"
            aria-label="stacked"
            onClick={() => setStacked(true)}
            className={`rounded px-2 py-1 text-xs ${stacked ? "bg-neutral-100" : ""}`}
          >
            ▤
          </button>
        </div>
      </header>

      <div className={`grid min-h-0 flex-1 ${stacked ? "grid-cols-1" : "lg:grid-cols-2"}`}>
        <section className="flex min-h-0 flex-col border-neutral-200 lg:border-r">
          <div className="border-b border-neutral-200 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-medium">{t("playground.state")}</h2>
              <span className={`text-xs ${stateValid ? "text-emerald-600" : "text-red-600"}`}>
                {stateValid ? t("playground.ready") : t("playground.invalid")}
              </span>
            </div>
            <JsonEditor value={stateText} onChange={setStateText} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">{t("playground.questions")}</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={formatJson} className="rounded-md border border-neutral-200 px-2 py-1 text-xs hover:bg-neutral-50">
                  {t("playground.format")}
                </button>
                <span className="grid h-6 w-6 place-items-center rounded-full border border-neutral-300 text-[11px]">
                  {questionCount}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-neutral-700">{t("playground.select")}</p>
              <Link href="/docs/presets" className="text-sm text-[#2f6fed] hover:underline">
                {t("playground.docs")}
              </Link>
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-auto pr-1">
              {useCustom ? (
                <textarea
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder={t("playground.placeholder")}
                  spellCheck={false}
                  className="h-48 w-full rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs outline-none focus:border-neutral-400"
                />
              ) : (
                PRESET_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyPreset(id)}
                    className={`lift w-full rounded-xl border px-3 py-3 text-left ${
                      preset === id
                        ? "border-neutral-950 bg-neutral-50 shadow-sm"
                        : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="text-sm font-semibold">{t(`presets.${id}.label`)}</div>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{t(`presets.${id}.blurb`)}</p>
                    <p className="mt-2 text-xs text-neutral-400">{t(`presets.${id}.example`)}</p>
                  </button>
                ))
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setUseCustom((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-md border border-neutral-200 text-lg leading-none transition hover:bg-neutral-50"
                aria-label={t("playground.custom")}
              >
                +
              </button>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium">
                {t("playground.runtime")}
              </span>
              <button
                type="button"
                onClick={run}
                disabled={loading || !stateValid || !customValid}
                className="ml-auto h-9 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                {loading ? t("playground.running") : t("playground.run")}
              </button>
            </div>
          </div>
        </section>

        <section className="flex min-h-[320px] flex-col bg-[#fafafa]">
          {showExamples || response == null ? (
            <Examples
              onPick={applyPreset}
              onClose={() => setShowExamples(false)}
            />
          ) : (
            <div className="fade-in flex min-h-0 flex-1 flex-col">
              <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-3">
                <h2 className="text-sm font-medium">{t("playground.response")}</h2>
                {error && <span className="text-xs text-red-600">{error}</span>}
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" onClick={() => setView("plain")} className={`rounded px-2 py-1 text-xs ${view === "plain" ? "bg-neutral-100" : ""}`}>
                    {t("playground.plain")}
                  </button>
                  <button type="button" onClick={() => setView("json")} className={`rounded px-2 py-1 text-xs ${view === "json" ? "bg-neutral-100" : ""}`}>
                    {t("playground.json")}
                  </button>
                  <button type="button" onClick={() => setShowExamples(true)} className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100">
                    {t("playground.back")}
                  </button>
                </div>
              </div>
              <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-neutral-800">
                {view === "json" ? JSON.stringify(response, null, 2) : plain}
              </pre>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Examples({ onPick, onClose }: { onPick: (id: PresetId) => void; onClose: () => void }) {
  const { t } = useI18n();
  const cards: PresetId[] = ["triage", "guard", "router"];
  return (
    <div className="fade-in min-h-0 flex-1 overflow-auto">
      <div className="flex items-start justify-between px-6 pt-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
            {t("playground.examples")}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{t("playground.learn")}</h2>
        </div>
        <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-900" aria-label={t("common.close")}>
          ×
        </button>
      </div>
      <p className="px-6 pt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {t("playground.walkthrough")}
      </p>
      <div className="grid gap-3 px-6 py-3 sm:grid-cols-3">
        {cards.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onPick(id)}
            className="card card-hover overflow-hidden text-left"
          >
            <div className="h-24 bg-[linear-gradient(145deg,#eef2ff,#fef3c7_60%,#d1fae5)]" />
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                {t(`presets.${id}.label`)}
              </p>
              <p className="mt-1 text-sm font-medium">{t(`presets.${id}.example`)}</p>
              <p className="mt-1 text-xs text-neutral-500">{t(`presets.${id}.hint`)}</p>
            </div>
          </button>
        ))}
      </div>
      <p className="px-6 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {t("playground.cases")}
      </p>
      <ul className="divide-y divide-neutral-200 px-6 pb-8">
        {PRESET_IDS.map((id) => (
          <li key={id}>
            <button type="button" onClick={() => onPick(id)} className="flex w-full items-baseline gap-3 py-3 text-left transition hover:bg-white">
              <span className="text-sm font-semibold">{t(`presets.${id}.label`)}</span>
              <span className="text-sm text-neutral-500">{t(`cases.${id}`)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={null}>
      <PlaygroundInner />
    </Suspense>
  );
}

function Flask() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" />
    </svg>
  );
}
