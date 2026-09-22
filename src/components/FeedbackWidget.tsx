"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useI18n } from "./LocaleProvider";

export function FeedbackWidget() {
  const { t } = useI18n();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("idea");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openPanel = () => setOpen(true);
    window.addEventListener("laya-open-feedback", openPanel);
    return () => window.removeEventListener("laya-open-feedback", openPanel);
  }, []);

  useEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    const focusable = node?.querySelector<HTMLElement>("select, textarea, button");
    focusable?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>("select, textarea, button"));
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, message }),
    });
    if (!res.ok) {
      setError(t("errors.generic"));
      return;
    }
    setSent(true);
    setMessage("");
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium shadow-lg transition hover:-translate-y-0.5"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setSent(false);
          setOpen(true);
        }}
      >
        {t("product.feedback")}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-4 sm:items-end" onMouseDown={() => setOpen(false)}>
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="modal-pop w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={titleId} className="text-base font-semibold">
                  {t("product.feedback")}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">{t("product.feedbackLede")}</p>
              </div>
              <button type="button" className="text-neutral-400" onClick={() => setOpen(false)} aria-label={t("common.close")}>
                ×
              </button>
            </div>
            <form onSubmit={onSubmit} className="mt-3 space-y-3">
              <label className="block text-xs text-neutral-500">
                {t("product.category")}
                <select className="field mt-1 h-10" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="bug">{t("product.bug")}</option>
                  <option value="idea">{t("product.idea")}</option>
                  <option value="other">{t("product.other")}</option>
                </select>
              </label>
              <label className="block text-xs text-neutral-500">
                {t("product.message")}
                <textarea
                  required
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="field mt-1 h-28 py-2"
                />
              </label>
              {sent && <p className="text-xs text-emerald-700">{t("product.sent")}</p>}
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" className="btn-black h-10 w-full text-sm">
                {t("product.send")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
