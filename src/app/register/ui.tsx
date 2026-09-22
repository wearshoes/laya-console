"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
import { LayaMark } from "@/components/LayaMark";
import { useI18n } from "@/components/LocaleProvider";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("register.mismatch"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(t(`errors.${data.error || "generic"}`));
        setLoading(false);
        return;
      }
      router.push("/home");
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
        <h1 className="mb-1 text-center text-[34px] font-semibold leading-[1.08] tracking-[-0.04em]">
          {t("register.title")}
        </h1>
        <p className="mb-1 text-center text-xs leading-relaxed text-neutral-500">{t("register.hint")}</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("register.namePlaceholder")}
          className="field"
          autoComplete="name"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("register.email")}
          className="field"
          autoComplete="email"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("register.password")}
          className="field"
          autoComplete="new-password"
        />
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={t("register.confirm")}
          className="field"
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading} className="btn-black">
          {loading ? t("register.submitting") : t("register.submit")}
        </button>
        {error && (
          <p className="text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <Link href="/login" className="text-center text-sm text-neutral-500 transition hover:text-neutral-900">
          {t("register.have")}
        </Link>
      </form>
    </AuthSplit>
  );
}
