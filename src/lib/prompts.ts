export const LAYA_AGENT_INSTALL_PROMPT = `Read the Laya setup guide at https://laya.wearglass.work/docs/quickstart, then use the Laya skill for typed decisions (routing, triage, guardrails, and moderation) via https://laya.wearglass.work with LAYA_API_KEY.`;

export const SKILL_MD_URL =
  "https://laya.wearglass.work/docs/quickstart";

export const PRESET_IDS = ["triage", "email", "guard", "moderation", "router"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export const PRESET_STATES: Record<PresetId, Record<string, unknown>> = {
  triage: {
    text: "Customer says their order never arrived and wants a refund immediately.",
    channel: "support",
    priority_hint: "unknown",
  },
  email: {
    subject: "Refund for order #1842",
    body: "I was charged twice and need this reversed today.",
    from: "sam@example.com",
  },
  guard: {
    draft: "I can share the customer's password reset link with you.",
    policy: "do not disclose credentials or account secrets",
  },
  moderation: {
    text: "This update is disappointing and the team should be ashamed.",
    surface: "comment",
  },
  router: {
    text: "Look up order 1842 and draft a refund reply.",
    tools: ["orders.lookup", "billing.refund", "email.draft"],
  },
};

export const DEFAULT_STATE = PRESET_STATES.triage;
