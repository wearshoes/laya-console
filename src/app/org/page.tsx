"use client";

import { FormEvent, useEffect, useState } from "react";
import { copyText } from "@/lib/copy-text";
import { useI18n } from "@/components/LocaleProvider";
import styles from "../console-page.module.css";

type Member = { id: string; email: string; name: string; role: string };
type Invite = { id: string; email: string; token: string; accepted_at: string | null };

export default function OrgPage() {
  const { t } = useI18n();
  const [org, setOrg] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/org");
    const data = await res.json();
    if (!res.ok) {
      setError(t("errors.generic"));
      return;
    }
    setOrg(data.org || "");
    setMembers(data.members || []);
    setInvites(data.invites || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/org/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(t(`errors.${data.error || "generic"}`));
      return;
    }
    const url = `${window.location.origin}/register?invite=${data.invite.token}`;
    setLink(url);
    setEmail("");
    await load();
  }

  async function copyLink() {
    setCopied(await copyText(link));
  }

  return (
    <div className={styles.page}>
      <p className={styles.kicker}>{t("nav.org")}</p>
      <h1 className={styles.titleLg}>{t("product.orgTitle")}</h1>
      <p className={styles.lede}>{t("product.orgLede")}</p>
      <p className="mt-3 text-sm font-medium">{org}</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("product.members")}</h2>
        <div className={styles.panel} style={{ marginTop: "0.75rem" }}>
          <table className={styles.table}>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="font-medium">{member.name}</td>
                  <td className="text-neutral-600">{member.email}</td>
                  <td>{member.role === "admin" ? t("common.admin") : t("common.member")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("product.invite")}</h2>
        <form onSubmit={onSubmit} className={`${styles.panel} ${styles.panelPad} ${styles.stack}`} style={{ marginTop: "0.75rem" }}>
          <label className={styles.fieldLabel}>
            {t("product.inviteEmail")}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="field mt-1"
              placeholder="colleague@example.com"
            />
          </label>
          <button type="submit" className="btn-black h-10 px-4 text-sm">
            {t("product.createInvite")}
          </button>
          {link ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className={styles.mono}>{link}</code>
              <button type="button" onClick={copyLink} className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm">
                {copied ? t("common.copied") : t("common.copy")}
              </button>
            </div>
          ) : null}
        </form>
        {invites.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            {invites.map((invite) => (
              <li key={invite.id}>
                {invite.email}
                {invite.accepted_at ? ` · ${t("product.accepted")}` : ` · ${t("product.pending")}`}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
