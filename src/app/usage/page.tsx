"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";

type DayRow = { day: string; requests: number; ok: number; avg_latency_ms: number | null };
type Account = { id: string; email: string; name: string; org: string };

export default function UsagePage() {
  const { t, locale } = useI18n();
  const [days, setDays] = useState<DayRow[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [scope, setScope] = useState<"own" | "all">("own");
  const [userId, setUserId] = useState("");
  const [range, setRange] = useState<"7" | "30" | "60">("7");
  const [outcome, setOutcome] = useState<"all" | "ok" | "error">("all");
  const [preset, setPreset] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        if (preset) params.set("preset", preset);
        if (outcome !== "all") params.set("outcome", outcome);
        const q = params.toString();
        const res = await fetch(`/api/usage${q ? `?${q}` : ""}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "generic");
        if (cancelled) return;
        setDays(data.days || []);
        setScope(data.scope === "all" ? "all" : "own");
        setAccounts(data.accounts || []);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "generic");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, preset, outcome]);

  const series = useMemo(() => fillDays(days, Number(range)), [days, range]);
  const totalRequests = series.reduce((s, d) => s + Number(d.requests || 0), 0);
  const totalOk = series.reduce((s, d) => s + Number(d.ok || 0), 0);
  const latency =
    series.filter((d) => d.avg_latency_ms != null).reduce((s, d, _, arr) => s + Number(d.avg_latency_ms || 0) / Math.max(1, arr.length), 0);

  function exportCsv() {
    const header = "day,requests,ok,avg_latency_ms";
    const body = series.map((d) => `${d.day},${d.requests},${d.ok},${d.avg_latency_ms ?? ""}`).join("\n");
    const blob = new Blob([`${header}\n${body}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laya-usage.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const fmt = new Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US");

  return (
    <div className="h-full overflow-auto px-6 py-5 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChartIcon />
          <h1 className="text-lg font-semibold">{t("usage.title")}</h1>
          <span className="text-sm text-neutral-500">{t("usage.delayed")}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            className="rounded-md border border-neutral-200 bg-white px-2 py-1.5"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as "all" | "ok" | "error")}
            aria-label={t("usage.allTraffic")}
          >
            <option value="all">{t("usage.allTraffic")}</option>
            <option value="ok">{t("usage.successful")}</option>
            <option value="error">{t("usage.errors")}</option>
          </select>
          <select
            className="rounded-md border border-neutral-200 bg-white px-2 py-1.5"
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            aria-label={t("usage.preset")}
          >
            <option value="">{t("usage.allPresets")}</option>
            <option value="triage">triage</option>
            <option value="email">email</option>
            <option value="guard">guard</option>
            <option value="moderation">moderation</option>
            <option value="router">router</option>
          </select>
          {scope === "all" && (
            <select
              className="rounded-md border border-neutral-200 bg-white px-2 py-1.5"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              aria-label={t("usage.account")}
            >
              <option value="">{t("usage.allAccounts")}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.org}
                </option>
              ))}
            </select>
          )}
          <select
            className="rounded-md border border-neutral-200 bg-white px-2 py-1.5"
            value={range}
            onChange={(e) => setRange(e.target.value as "7" | "30" | "60")}
          >
            <option value="7">{t("usage.last7")}</option>
            <option value="30">{t("usage.last30")}</option>
            <option value="60">{t("usage.last60")}</option>
          </select>
          <span className="rounded-md border border-neutral-200 px-2 py-1.5 text-neutral-600">{t("usage.daily")}</span>
          <button type="button" onClick={exportCsv} className="rounded-md border border-neutral-200 p-2 hover:bg-neutral-50" aria-label={t("usage.export")}>
            <Download />
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        {scope === "all" ? t("usage.scopeAll") : t("usage.scopeOwn")} · {t("usage.sqlite")}
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{t(`errors.${error}`)}</p>}

      <ChartBlock title={t("usage.requests")} total={loading ? "…" : fmt.format(totalRequests)} color="#3b82f6" points={series.map((d) => ({ label: d.day, value: Number(d.requests) }))} locale={locale} />
      <ChartBlock title={t("usage.successful")} total={loading ? "…" : fmt.format(totalOk)} color="#22c55e" points={series.map((d) => ({ label: d.day, value: Number(d.ok) }))} locale={locale} />
      <ChartBlock title={t("usage.latency")} total={loading ? "…" : `${Math.round(latency) || 0} ${t("usage.ms")}`} color="#6366f1" points={series.map((d) => ({ label: d.day, value: Number(d.avg_latency_ms || 0) }))} locale={locale} />
      {!loading && totalRequests === 0 && <p className="mt-2 text-sm text-neutral-500">{t("usage.empty")}</p>}
    </div>
  );
}

function ChartBlock({
  title,
  total,
  color,
  points,
  locale,
}: {
  title: string;
  total: string;
  color: string;
  points: { label: string; value: number }[];
  locale: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const ticks = [max, max / 2, 0];
  const labelEvery = points.length > 14 ? Math.ceil(points.length / 6) : 1;
  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-2xl font-semibold tabular-nums">{total}</p>
      </div>
      <svg viewBox="0 0 640 180" className="mt-3 h-52 w-full">
        {ticks.map((tick) => {
          const y = 12 + 140 - (tick / max) * 140;
          return (
            <g key={tick}>
              <line x1="36" x2="630" y1={y} y2={y} stroke="#ececec" />
              <text x="30" y={y + 3} textAnchor="end" fontSize="10" fill="#a3a3a3">
                {formatTick(tick)}
              </text>
            </g>
          );
        })}
        {points.map((p, i) => {
          const slot = 594 / Math.max(1, points.length);
          const bar = Math.max(2, slot * 0.45);
          const h = (p.value / max) * 140;
          const x = 36 + i * slot + (slot - bar) / 2;
          const y = 152 - h;
          return (
            <rect key={p.label} x={x} y={y} width={bar} height={Math.max(p.value > 0 ? 2 : 0, h)} rx="1" fill={color}>
              <title>{`${p.label}: ${p.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between pl-9 pr-2 text-[11px] text-neutral-400">
        {points.map((p, i) => (
          <span key={p.label} className={i % labelEvery === 0 ? "" : "invisible"}>
            {formatDay(p.label, locale)}
          </span>
        ))}
      </div>
    </section>
  );
}

function fillDays(rows: DayRow[], n: number): DayRow[] {
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: DayRow[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    const row = map.get(key);
    out.push(row || { day: key, requests: 0, ok: 0, avg_latency_ms: null });
  }
  return out;
}

function formatDay(day: string, locale: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatTick(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(Math.round(n));
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" />
    </svg>
  );
}
function Download() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" />
    </svg>
  );
}
