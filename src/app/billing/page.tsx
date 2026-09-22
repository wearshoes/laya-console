"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";

type Billing = {
  charging: boolean;
  plan: string;
  amountDue: number;
  includedCredits: number;
  usedCredits: number;
  meteredRequests: number;
};

export default function BillingPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Billing | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing")
      .then((res) => res.json())
      .then((body) => setData(body));
  }, []);

  async function topup() {
    const res = await fetch("/api/billing/topup", { method: "POST" });
    const body = await res.json();
    setNotice(body.error === "payments_disabled" ? t("product.disabledBody") : t("errors.generic"));
  }

  return (
    <div className="h-full overflow-auto px-6 py-8 md:px-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">{t("product.notBilled")}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("product.billingTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{t("product.billingLede")}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("product.plan")} value={t("product.planName")} />
        <Stat label={t("product.amountDue")} value={`$${(data?.amountDue ?? 0).toFixed(2)}`} />
        <Stat label={t("product.credits")} value={String(data?.includedCredits ?? 10000)} />
        <Stat label={t("product.used")} value={String(data?.usedCredits ?? 0)} />
      </div>
      <p className="mt-4 text-sm text-neutral-600">
        {t("product.requests")}: {data?.meteredRequests ?? 0}
      </p>
      <div className="card mt-6 max-w-xl p-5">
        <h2 className="text-base font-semibold">{t("product.disabledTitle")}</h2>
        <p className="mt-2 text-sm text-neutral-600">{t("product.disabledBody")}</p>
        <button type="button" onClick={topup} className="btn-black mt-4 h-10 px-4 text-sm">
          {t("product.addCredits")}
        </button>
        {notice && <p className="mt-3 text-sm text-neutral-700">{notice}</p>}
      </div>
      <section className="mt-8">
        <h2 className="text-base font-semibold">{t("product.invoices")}</h2>
        <p className="mt-2 text-sm text-neutral-500">{t("product.invoicesEmpty")}</p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
