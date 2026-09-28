"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JsonEditor } from "@/components/JsonEditor";
import { Modal } from "@/components/Modal";
import { useI18n } from "@/components/LocaleProvider";
import { copyText } from "@/lib/copy-text";
import { PRESET_IDS, PRESET_STATES, type PresetId } from "@/lib/prompts";
import styles from "./playground.module.css";

type ViewMode = "cards" | "json" | "plain";

const PLAYGROUND_PRIMITIVES: Record<PresetId, { label: string; blurb: string; example: string; hint: string }> = {
  triage: { label: "Noul", blurb: "Evaluate how true something is", example: 'Is `food` a sandwich?', hint: "Evaluate a claim against the state." },
  email: { label: "Score", blurb: "Set up a rubric to grade with", example: 'How much did `subject` contribute?', hint: "Return a calibrated score." },
  guard: { label: "Choice", blurb: "Ask a multiple choice question", example: 'What color is `object`?', hint: "Choose one option from a list." },
  moderation: { label: "Moderation", blurb: "Review a user comment", example: "Should this comment be escalated?", hint: "Classify a piece of text." },
  router: { label: "Router", blurb: "Pick the next agent tool", example: "Which tool should handle this?", hint: "Route the next action." },
};

const PLAYGROUND_CASES: { id: PresetId; title: string; body: string }[] = [
  { id: "triage", title: "Resumé screening", body: "Assess an engineering candidate" },
  { id: "email", title: "Support agent audit", body: "Audit a customer support agent's chat session" },
  { id: "guard", title: "LLM guardrails", body: "Detect jailbreak attempts and assess potential harm" },
];

const PRIMITIVE_QUESTIONS: Partial<Record<PresetId, Record<string, unknown>>> = {
  triage: {
    new_noul_1: {
      type: "noul",
      instructions: "Ask a yes or no question",
      criteria: { true: "", false: "" },
    },
  },
  email: {
    new_score_1: {
      type: "score",
      instructions: "Where does the state fall on the scale?",
      criteria: ["Lowest level of one dimension", "Middle level of the same dimension", "Highest level of the same dimension"],
    },
  },
  guard: {
    new_choice_1: {
      type: "choice",
      instructions: "Which option best fits the state?",
      criteria: { option_a: "Description of an option", option_b: "Another description of a distinct option", option_c: "Another mutually exclusive option" },
    },
  },
};

function PlaygroundInner() {
  const { t } = useI18n();
  const [stateText, setStateText] = useState(JSON.stringify({ example_state: "Add context for Laya to evaluate" }, null, 2));
  const [questionsText, setQuestionsText] = useState("{}");
  const [preset, setPreset] = useState<PresetId>("triage");
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("cards");
  const [showExamples, setShowExamples] = useState(true);
  const [shared, setShared] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTitle, setShareTitle] = useState("");
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
    try {
      return Object.keys(JSON.parse(questionsText)).length;
    } catch {
      return 0;
    }
  }, [questionsText]);

  const questionsValid = useMemo(() => {
    try {
      const parsed = JSON.parse(questionsText);
      return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed));
    } catch {
      return false;
    }
  }, [questionsText]);

  function applyPreset(id: PresetId) {
    setPreset(id);
    setUseCustom(false);
    setStateText(JSON.stringify(PRESET_STATES[id], null, 2));
    setQuestionsText(JSON.stringify(PRIMITIVE_QUESTIONS[id] || {}, null, 2));
  }

  function applyPrimitive(id: PresetId) {
    setPreset(id);
    setUseCustom(false);
    setQuestionsText(JSON.stringify(PRIMITIVE_QUESTIONS[id] || {}, null, 2));
  }

  function formatJson() {
    try {
      if (useCustom) setCustom(JSON.stringify(JSON.parse(custom), null, 2));
      else setStateText(JSON.stringify(JSON.parse(stateText), null, 2));
      setQuestionsText(JSON.stringify(JSON.parse(questionsText), null, 2));
    } catch {
      /* keep invalid text visible */
    }
  }

  function clearAll() {
    applyPreset("triage");
    setCustom("");
    setQuestionsText("{}");
    setResponse(null);
    setError(null);
    setShowExamples(true);
  }

  function openShare() {
    setShareTitle(useCustom ? "Custom questions" : preset);
    setShared(false);
    setShareUrl("");
    setShareOpen(true);
  }

  async function share() {
    const parsed = JSON.parse(stateText);
    const body = useCustom
      ? { title: shareTitle || "Custom questions", preset: null, state: { state: parsed, questions: JSON.parse(custom) } }
      : { title: shareTitle || preset, preset, state: parsed };
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
      else if (questionCount > 0) body.questions = JSON.parse(questionsText);
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
      setView("cards");
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
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <Flask />
        <h1 className={styles.toolbarTitle}>{t("playground.title")}</h1>
        <button type="button" onClick={clearAll} className={styles.toolBtn}>
          {t("playground.clear")}
        </button>
        <button type="button" onClick={() => setShowExamples(true)} className={styles.toolBtn}>
          {t("playground.examples")}
        </button>
        <button type="button" onClick={openShare} disabled={!stateValid || !customValid} className={styles.toolBtn}>
          {t("playground.share")}
        </button>
      </header>

      <div className={styles.workspace}>
        <section className={styles.editor} aria-label={t("playground.state")}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>{t("playground.state")}</h2>
              <span className={stateValid ? styles.statusOk : styles.statusBad}>
                {stateValid ? t("playground.ready") : t("playground.invalid")}
              </span>
            </div>
              <JsonEditor value={stateText} onChange={setStateText} />
          </div>

          <div className={styles.questions}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>{t("playground.questions")}</h2>
              <div className="flex items-center gap-2">
                <button type="button" onClick={formatJson} className={styles.toolBtn}>
                  {t("playground.format")}
                </button>
                <span className="grid h-6 w-6 place-items-center rounded-full border border-neutral-300 text-[11px]">
                  {questionCount}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-neutral-700">{t("playground.select")}</p>
              <Link href="/docs/api/presets" className={styles.linkBlue}>
                {t("playground.docs")}
              </Link>
            </div>

            <JsonEditor value={questionsText} onChange={setQuestionsText} rows={8} />

            <div className={styles.presetList}>
              {useCustom ? (
                <textarea
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder={t("playground.placeholder")}
                  spellCheck={false}
                  className={styles.customArea}
                />
              ) : (
                PRESET_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyPrimitive(id)}
                    className={`${styles.presetCard} ${preset === id ? styles.presetCardActive : ""}`}
                  >
                    <div className={styles.presetLabel}>{PLAYGROUND_PRIMITIVES[id].label}</div>
                    <p className={styles.presetBlurb}>{PLAYGROUND_PRIMITIVES[id].blurb}</p>
                  </button>
                ))
              )}
            </div>

            <div className={styles.runBar}>
              <button
                type="button"
                onClick={() => setUseCustom((v) => !v)}
                className={styles.toolBtn}
                aria-label={t("playground.custom")}
              >
                {useCustom ? "←" : "+"}
              </button>
              <span className={styles.runtimePill}>{t("playground.runtime")}</span>
              <button
                type="button"
                onClick={run}
                disabled={loading || !stateValid || !customValid || !questionsValid}
                className={styles.runBtn}
              >
                {loading ? t("playground.running") : t("playground.run")}
              </button>
            </div>
          </div>
        </section>

        <section className={styles.right} aria-label={t("playground.examples")}>
          {showExamples || response == null ? (
            <Examples onPick={applyPreset} />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className={styles.responseHead}>
                <h2 className={styles.panelTitle}>{t("playground.response")}</h2>
                {error && <span className={styles.statusBad}>{error}</span>}
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setView("cards")}
                    className={`${styles.toolBtn} ${view === "cards" ? styles.toolBtnActive : ""}`}
                  >
                    {t("playground.cards")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("plain")}
                    className={`${styles.toolBtn} ${view === "plain" ? styles.toolBtnActive : ""}`}
                  >
                    {t("playground.plain")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("json")}
                    className={`${styles.toolBtn} ${view === "json" ? styles.toolBtnActive : ""}`}
                  >
                    {t("playground.json")}
                  </button>
                  <button type="button" onClick={() => setShowExamples(true)} className={styles.toolBtn}>
                    {t("playground.back")}
                  </button>
                </div>
              </div>
              <div className={styles.responseBody}>
                {view === "cards" ? (
                  <AnswerCards data={response} />
                ) : (
                  <pre className={styles.answerValue}>
                    {view === "json" ? JSON.stringify(response, null, 2) : plain}
                  </pre>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {shareOpen && (
        <Modal title={t("playground.share")} onClose={() => setShareOpen(false)}>
          <p className="mt-2 text-sm text-neutral-600">{t("playground.shareBody")}</p>
          <label className="mt-3 block text-xs text-neutral-500">
            {t("product.shareTitle")}
            <input value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} className="field mt-1" />
          </label>
          <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-neutral-950 p-3 font-mono text-[11px] text-neutral-100">
            {stateText}
          </pre>
          {shareUrl ? (
            <Link href={shareUrl} className="mt-3 block truncate text-sm text-[#2f6fed]">
              {shared ? t("playground.shared") : shareUrl}
            </Link>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="rounded-md border border-neutral-200 px-3 py-2 text-sm" onClick={() => setShareOpen(false)}>
              {t("common.cancel")}
            </button>
            <button type="button" className="btn-black h-10 px-3 text-sm" onClick={share} disabled={!stateValid || !customValid}>
              {t("playground.createLink")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Examples({ onPick }: { onPick: (id: PresetId) => void }) {
  const { t } = useI18n();
  const cards: PresetId[] = ["triage", "email", "guard"];
  return (
    <div className={styles.examples}>
      <div className={styles.examplesHead}>
        <div>
          <p className={styles.eyebrow}>{t("playground.examples")}</p>
          <h2 className={styles.examplesTitle}>{t("playground.learn")}</h2>
        </div>
      </div>
      <p className={styles.sectionLabel}>{t("playground.walkthrough")}</p>
      <div className={styles.walkGrid}>
        {cards.map((id, index) => (
          <button key={id} type="button" onClick={() => onPick(id)} className={styles.walkCard}>
            <div className={`${styles.walkArt} ${styles[`walkArt${index + 1}` as "walkArt1" | "walkArt2" | "walkArt3"]}`} />
            <div className={styles.walkBody}>
              <p className={styles.walkKicker}>{PLAYGROUND_PRIMITIVES[id].label}</p>
              <p className={styles.walkExample}>{PLAYGROUND_PRIMITIVES[id].example}</p>
              <p className={styles.walkHint}>{PLAYGROUND_PRIMITIVES[id].hint}</p>
            </div>
          </button>
        ))}
      </div>
      <p className={styles.sectionLabel}>{t("playground.cases")}</p>
      <ul className={styles.caseList}>
        {PLAYGROUND_CASES.map(({ id, title, body }) => (
          <li key={id}>
            <button type="button" onClick={() => onPick(id)} className={styles.caseBtn}>
              <span className={styles.caseLabel}>{title}</span>
              <span className={styles.caseText}>{body}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnswerCards({ data }: { data: unknown }) {
  const entries = flattenAnswers(data);
  if (!entries.length) {
    return <pre className={styles.answerValue}>{JSON.stringify(data, null, 2)}</pre>;
  }
  return (
    <div className={styles.answerGrid}>
      {entries.map((item) => (
        <article key={item.key} className={styles.answerCard}>
          <h3 className={styles.answerKey}>{item.key}</h3>
          <pre className={styles.answerValue}>{item.value}</pre>
        </article>
      ))}
    </div>
  );
}

function flattenAnswers(data: unknown): { key: string; value: string }[] {
  if (data == null) return [];
  if (typeof data !== "object") return [{ key: "result", value: String(data) }];
  const obj = data as Record<string, unknown>;
  const prefer = obj.answers ?? obj.result ?? obj.data ?? obj;
  if (prefer && typeof prefer === "object" && !Array.isArray(prefer)) {
    return Object.entries(prefer as Record<string, unknown>).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    }));
  }
  if (Array.isArray(prefer)) {
    return prefer.map((value, i) => ({
      key: `answer_${i + 1}`,
      value: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    }));
  }
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: typeof value === "string" ? value : JSON.stringify(value, null, 2),
  }));
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" />
    </svg>
  );
}
