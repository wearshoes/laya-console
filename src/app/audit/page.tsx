"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";

type EventRow = {
  id: number;
  email: string | null;
  org: string | null;
  api_key_id: string | null;
  key_prefix: string | null;
  key_name: string | null;
  route: string;
  preset: string | null;
  status: number | null;
  latency_ms: number | null;
  auth_failure: number;
  created_at: string;
};

type Account = { id: string; email: string; name: string; org: string };
type KeyOpt = { id: string; name: string; key_prefix: string; email: string };
type Detail = EventRow & {
  ip: string | null;
  user_agent: string | null;
  request_json: string | null;
  response_json: string | null;
  user_id: string | null;
};

export default function AuditPage() {
  const { t, locale } = useI18n();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [keys, setKeys] = useState<KeyOpt[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [q, setQ] = useState("");
  const [userId, setUserId] = useState("");
  const [apiKeyId, setApiKeyId] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Detail | null>(null);
  const limit = 40;

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (userId) sp.set("userId", userId);
    if (apiKeyId) sp.set("apiKeyId", apiKeyId);
    if (status) sp.set("status", status);
    if (kind && kind !== "all") sp.set("kind", kind);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    sp.set("limit", String(limit));
    sp.set("offset", String(offset));
    try {
      const res = await fetch(`/api/audit?${sp.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generic");
      setEvents(data.events || []);
      setAccounts(data.accounts || []);
      setKeys(data.keys || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "generic");
    } finally {
      setLoading(false);
    }
  }, [q, userId, apiKeyId, status, kind, from, to, offset]);

  useEffect(() => {
    load();
  }, [load]);

  async function openRow(id: number) {
    const res = await fetch(`/api/audit/${id}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "not_found");
      return;
    }
    setDetail(data.event);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-5">
        <h1 className="text-lg font-semibold">{t("audit.title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-neutral-500">{t("audit.lede")}</p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={q}
            onChange={(e) => {
              setOffset(0);
              setQ(e.target.value);
            }}
            placeholder={t("audit.search")}
            className="field h-10 md:col-span-2 xl:col-span-4"
          />
          <select className="field h-10" value={userId} onChange={(e) => { setOffset(0); setUserId(e.target.value); }} aria-label={t("audit.account")}>
            <option value="">{t("audit.allAccounts")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name} · {a.org}</option>
            ))}
          </select>
          <select className="field h-10" value={apiKeyId} onChange={(e) => { setOffset(0); setApiKeyId(e.target.value); }} aria-label={t("audit.apiKey")}>
            <option value="">{t("audit.allKeys")}</option>
            <option value="session">{t("audit.session")}</option>
            {keys.map((k) => (
              <option key={k.id} value={k.id}>{k.name} · {k.key_prefix}</option>
            ))}
          </select>
          <select className="field h-10" value={status} onChange={(e) => { setOffset(0); setStatus(e.target.value); }} aria-label={t("audit.status")}>
            <option value="">{t("audit.anyStatus")}</option>
            <option value="2xx">2xx</option>
            <option value="4xx">4xx</option>
            <option value="5xx">5xx</option>
          </select>
          <select className="field h-10" value={kind} onChange={(e) => { setOffset(0); setKind(e.target.value); }} aria-label={t("audit.kind")}>
            <option value="all">{t("audit.allKinds")}</option>
            <option value="model">{t("audit.model")}</option>
            <option value="auth">{t("audit.auth")}</option>
          </select>
          <label className="text-xs text-neutral-500">
            {t("audit.from")}
            <input type="date" value={from} onChange={(e) => { setOffset(0); setFrom(e.target.value); }} className="field mt-1 h-10" />
          </label>
          <label className="text-xs text-neutral-500">
            {t("audit.to")}
            <input type="date" value={to} onChange={(e) => { setOffset(0); setTo(e.target.value); }} className="field mt-1 h-10" />
          </label>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {error && <p className="px-6 pt-4 text-sm text-red-600">{t(`errors.${error}`)}</p>}
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white text-xs text-neutral-500 shadow-[inset_0_-1px_0_#e5e5e5]">
            <tr>
              <th className="px-4 py-3 font-medium">{t("audit.time")}</th>
              <th className="px-4 py-3 font-medium">{t("audit.account")}</th>
              <th className="px-4 py-3 font-medium">{t("audit.apiKey")}</th>
              <th className="px-4 py-3 font-medium">{t("audit.route")}</th>
              <th className="px-4 py-3 font-medium">{t("audit.preset")}</th>
              <th className="px-4 py-3 font-medium">{t("audit.status")}</th>
              <th className="px-4 py-3 font-medium">{t("audit.latency")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-neutral-500">{t("common.loading")}</td></tr>
            )}
            {!loading && events.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-neutral-500">{t("audit.empty")}</td></tr>
            )}
            {events.map((ev) => (
              <tr key={ev.id} onClick={() => openRow(ev.id)} className="cursor-pointer border-b border-neutral-100 transition hover:bg-neutral-50">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-600">{formatWhen(ev.created_at, locale)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{ev.org || "—"}</div>
                  <div className="text-xs text-neutral-500">{ev.email || ""}</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {ev.auth_failure ? (
                    <span className="text-amber-700">{t("audit.authFailure")}</span>
                  ) : ev.key_name ? (
                    <span className="font-mono">{ev.key_name} · {ev.key_prefix}</span>
                  ) : (
                    t("audit.session")
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{ev.route}</td>
                <td className="px-4 py-3 text-xs">{ev.preset || "—"}</td>
                <td className="px-4 py-3">
                  <Status n={ev.status} pending={t("audit.pending")} />
                </td>
                <td className="px-4 py-3 tabular-nums text-xs">{ev.latency_ms != null ? `${ev.latency_ms} ms` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-sm">
        <span className="text-neutral-500">
          {t("audit.showing")} {events.length === 0 ? 0 : offset + 1}–{offset + events.length} {t("audit.of")} {total}
        </span>
        <div className="flex gap-2">
          <button type="button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} className="rounded-md border px-3 py-1.5 disabled:opacity-40">
            {t("audit.prev")}
          </button>
          <button type="button" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} className="rounded-md border px-3 py-1.5 disabled:opacity-40">
            {t("audit.next")}
          </button>
        </div>
      </div>

      {detail && (
        <aside className="fade-in fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">{t("audit.detail")} #{detail.id}</h2>
            <button type="button" onClick={() => setDetail(null)} className="text-neutral-500 hover:text-neutral-950">{t("common.close")}</button>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-auto px-5 py-4 text-sm">
            <Meta label={t("audit.time")} value={formatWhen(detail.created_at, locale)} />
            <Meta label={t("audit.account")} value={`${detail.org || "—"} · ${detail.email || "—"}`} />
            <Meta label={t("audit.apiKey")} value={detail.key_name ? `${detail.key_name} (${detail.key_prefix})` : t("audit.session")} />
            <Meta label={t("audit.route")} value={detail.route} />
            <Meta label={t("audit.preset")} value={detail.preset || "—"} />
            <Meta label={t("audit.status")} value={detail.status == null ? t("audit.pending") : String(detail.status)} />
            <Meta label={t("audit.latency")} value={detail.latency_ms != null ? `${detail.latency_ms} ms` : "—"} />
            <Meta label={t("audit.ip")} value={detail.ip || "—"} />
            <Meta label={t("audit.ua")} value={detail.user_agent || "—"} />
            <JsonBlock title={t("audit.request")} raw={detail.request_json} empty={t("audit.noBody")} expand={t("audit.expand")} collapse={t("audit.collapse")} />
            <JsonBlock title={t("audit.response")} raw={detail.response_json} empty={t("audit.noBody")} expand={t("audit.expand")} collapse={t("audit.collapse")} />
          </div>
        </aside>
      )}
    </div>
  );
}

function Status({ n, pending }: { n: number | null; pending: string }) {
  if (n == null) return <span className="text-xs text-neutral-500">{pending}</span>;
  const cls = n < 300 ? "bg-emerald-50 text-emerald-700" : n < 500 ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{n}</span>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="mt-0.5 break-all text-neutral-800">{value}</p>
    </div>
  );
}

function JsonBlock({
  title,
  raw,
  empty,
  expand,
  collapse,
}: {
  title: string;
  raw: string | null;
  empty: string;
  expand: string;
  collapse: string;
}) {
  const [open, setOpen] = useState(false);
  let pretty = raw || "";
  if (raw) {
    try {
      pretty = JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      pretty = raw;
    }
  }
  const limit = 1400;
  const shown = !pretty ? "" : open || pretty.length <= limit ? pretty : `${pretty.slice(0, limit)}…`;
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-neutral-400">{title}</p>
        {pretty.length > limit && (
          <button type="button" className="text-xs text-[#2f6fed]" onClick={() => setOpen((v) => !v)}>
            {open ? collapse : expand}
          </button>
        )}
      </div>
      <pre className="mt-1 max-h-80 overflow-auto rounded-lg bg-neutral-950 p-3 font-mono text-[11px] leading-relaxed text-neutral-100">
        {shown || empty}
      </pre>
    </div>
  );
}

function formatWhen(iso: string, locale: string) {
  const normalized = iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(locale === "zh-CN" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
