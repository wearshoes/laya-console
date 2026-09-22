"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/LocaleProvider";

type UserRow = {
  id: string;
  email: string;
  name: string;
  org: string;
  role: "member" | "admin";
  created_at: string;
};

type FeedbackRow = { id: number; email: string; category: string; message: string; created_at: string };

export default function AdminPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [actorId, setActorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "forbidden");
      return;
    }
    setUsers(data.users || []);
    setActorId(data.actorId || "");
    setError(null);
    const notes = await fetch("/api/feedback");
    if (notes.ok) {
      const body = await notes.json();
      setFeedback(body.feedback || []);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(id: string, role: "member" | "admin") {
    setNotice(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "generic");
      return;
    }
    setNotice(t("admin.saved"));
    await load();
  }

  return (
    <div className="h-full overflow-auto px-6 py-6 md:px-8">
      <h1 className="text-lg font-semibold">{t("admin.title")}</h1>
      <p className="mt-1 max-w-2xl text-sm text-neutral-500">{t("admin.lede")}</p>
      {error && <p className="mt-3 text-sm text-red-600">{t(`errors.${error}`)}</p>}
      {notice && <p className="mt-3 text-sm text-emerald-700">{notice}</p>}
      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("admin.email")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.name")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.org")}</th>
              <th className="px-4 py-3 font-medium">{t("admin.role")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3">
                  {u.email} {u.id === actorId && <span className="text-xs text-neutral-400">({t("admin.you")})</span>}
                </td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-neutral-600">{u.org}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1.5"
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as "member" | "admin")}
                  >
                    <option value="member">{t("common.member")}</option>
                    <option value="admin">{t("common.admin")}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="mt-8">
        <h2 className="text-base font-semibold">{t("product.feedback")}</h2>
        <p className="mt-1 text-sm text-neutral-500">{t("product.feedbackLede")}</p>
        <ul className="mt-3 divide-y divide-neutral-200">
          {feedback.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              <p className="text-xs text-neutral-500">
                {item.email} · {item.category} · {item.created_at}
              </p>
              <p className="mt-1">{item.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
