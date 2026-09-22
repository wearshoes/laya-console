"use client";

import { FormEvent, useEffect, useState } from "react";
import { copyText } from "@/lib/copy-text";
import { useI18n } from "@/components/LocaleProvider";

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
    <div className="h-full overflow-auto px-6 py-8 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("product.orgTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm text-neutral-600">{t("product.orgLede")}</p>
      <p className="mt-3 text-sm font-medium">{org}</p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <section className="mt-6">
        <h2 className="text-base font-semibold">{t("product.members")}</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-left text-sm">
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{member.email}</td>
                  <td className="px-4 py-3">{member.role === "admin" ? t("common.admin") : t("common.member")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form onSubmit={onSubmit} className="card mt-8 max-w-xl p-5">
        <h2 className="text-base font-semibold">{t("product.invite")}</h2>
        <label className="mt-3 block text-xs text-neutral-500">
          {t("product.inviteEmail")}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-1"
          />
        </label>
        <button type="submit" className="btn-black mt-3 h-10 px-4 text-sm">
          {t("product.createInvite")}
        </button>
        {link && (
          <div className="mt-4">
            <p className="text-xs text-neutral-500">{t("product.inviteLink")}</p>
            <button type="button" onClick={copyLink} className="mt-1 break-all text-left text-sm text-[#2f6fed]">
              {copied ? t("common.copied") : link}
            </button>
          </div>
        )}
      </form>

      <section className="mt-8">
        <h2 className="text-base font-semibold">{t("product.pending")}</h2>
        <ul className="mt-3 divide-y divide-neutral-200">
          {invites.map((invite) => (
            <li key={invite.id} className="flex items-center justify-between py-3 text-sm">
              <span>{invite.email}</span>
              <span className="text-neutral-500">{invite.accepted_at ? t("product.accepted") : invite.token}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
