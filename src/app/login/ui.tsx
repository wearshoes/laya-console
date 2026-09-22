"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
import { LayaMark } from "@/components/LayaMark";
import { useI18n } from "@/components/LocaleProvider";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(t(`errors.${data.error || "invalid_credentials"}`));
        setLoading(false);
        return;
      }
      const dest = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/home";
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.generic"));
      setLoading(false);
    }
  }

  return (
    <AuthSplit>
      <form onSubmit={onSubmit} className="flex w-full max-w-[380px] flex-col gap-3.5">
        <LayaMark className="mx-auto mb-1 h-11 w-11 text-neutral-950" />
        <h1 className="mb-2 text-center text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-neutral-950">
          {t("login.welcome")}
        </h1>
        <label className="sr-only" htmlFor="email">
          {t("login.email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("login.email")}
          className="field"
        />
        <div className="relative">
          <label className="sr-only" htmlFor="password">
            {t("login.password")}
          </label>
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.password")}
            className="field pr-16"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500"
            onClick={() => setShow((v) => !v)}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn-black">
          {loading ? t("login.submitting") : t("login.submit")}
        </button>
        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Link href="/register" className="text-center text-sm text-neutral-500 transition hover:text-neutral-900">
          {t("login.create")}
        </Link>
        <p className="mt-2 text-center text-xs leading-relaxed text-neutral-500">
          {t("login.legal")}{" "}
          <Link href="/legal/terms" className="underline underline-offset-2">
            {t("login.terms")}
          </Link>{" "}
          {t("login.and")}{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2">
            {t("login.privacy")}
          </Link>
        </p>
      </form>
    </AuthSplit>
  );
}
