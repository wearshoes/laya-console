"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";

type DayRow = { day: string; requests: number; ok: number; avg_latency_ms: number | null };

/** Home Quickstart Usage card — real /api/usage sparkline only. */
export function HomeUsageCard() {
  const { t, locale } = useI18n();
  const [days, setDays] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/usage");
        const data = await res.json();
        if (!cancelled && res.ok) setDays(data.days || []);
      } catch {
        /* keep empty sparkline */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const series = useMemo(() => fillLastDays(days, 14), [days]);
  const total = series.reduce((sum, d) => sum + Number(d.requests || 0), 0);
  const fmt = new Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : "en-US", {
    notation: total >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  });

  return (
    <section className="border-t border-neutral-200 px-4 py-3" aria-label={t("nav.usage")}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-neutral-950">{t("nav.usage")}</h3>
        <Link href="/usage" className="text-sm text-[#2f6fed] hover:underline">
          {t("home.view")}
        </Link>
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-neutral-400">{t("usage.requests")}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{loading ? "…" : fmt.format(total)}</p>
      <Sparkline points={series.map((d) => Number(d.requests || 0))} />
    </section>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(1, ...points);
  const w = 220;
  const h = 36;
  const step = w / Math.max(1, points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-9 w-full text-neutral-400" aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function fillLastDays(rows: DayRow[], n: number): DayRow[] {
  const map = new Map(rows.map((r) => [r.day, r]));
  const out: DayRow[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    out.push(map.get(key) || { day: key, requests: 0, ok: 0, avg_latency_ms: null });
  }
  return out;
}
