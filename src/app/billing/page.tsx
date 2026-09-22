"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";
import styles from "../console-page.module.css";

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
    <div className={styles.page}>
      <p className={styles.kicker}>{t("product.notBilled")}</p>
      <h1 className={styles.titleLg}>{t("product.billingTitle")}</h1>
      <p className={styles.lede}>{t("product.billingLede")}</p>

      <div className={styles.statGrid}>
        <article className={styles.stat}>
          <p className={styles.statLabel}>{t("product.plan")}</p>
          <p className={styles.statValue}>{t("product.planName")}</p>
        </article>
        <article className={styles.stat}>
          <p className={styles.statLabel}>{t("product.amountDue")}</p>
          <p className={styles.statValue}>{`$${(data?.amountDue ?? 0).toFixed(2)}`}</p>
        </article>
        <article className={styles.stat}>
          <p className={styles.statLabel}>{t("product.credits")}</p>
          <p className={styles.statValue}>{String(data?.includedCredits ?? 10000)}</p>
        </article>
        <article className={styles.stat}>
          <p className={styles.statLabel}>{t("product.used")}</p>
          <p className={styles.statValue}>{String(data?.usedCredits ?? 0)}</p>
        </article>
      </div>

      <p className={styles.muted}>
        {t("product.requests")}: {data?.meteredRequests ?? 0}
      </p>

      <div className={`${styles.panel} ${styles.panelPad}`} style={{ marginTop: "1.5rem", maxWidth: "36rem" }}>
        <h2 className={styles.sectionTitle}>{t("product.disabledTitle")}</h2>
        <p className={styles.muted}>{t("product.disabledBody")}</p>
        <button type="button" onClick={topup} className="btn-black mt-4 h-10 px-4 text-sm">
          {t("product.addCredits")}
        </button>
        {notice && <p className="mt-3 text-sm text-neutral-700">{notice}</p>}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("product.invoices")}</h2>
        <p className={styles.muted}>{t("product.invoicesEmpty")}</p>
      </section>
    </div>
  );
}
