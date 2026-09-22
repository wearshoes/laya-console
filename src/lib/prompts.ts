export const LAYA_AGENT_INSTALL_PROMPT = `Install the Laya skill. If you're in Claude Code, run \`claude plugin marketplace add wearshoes/laya-skills\`, then \`claude plugin install laya-ai@wearshoes/laya-skills\`. If you're in another agent, run \`npx skills add wearshoes/laya-skills --skill laya-ai\` and select your agent. Use one installation method. You can read the skill at https://github.com/wearshoes/laya-skills or https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md. Then use the Laya skill for fast typed decisions (routing, triage, guardrails, moderation) via https://laya.wearglass.work with LAYA_API_KEY.`;

export const SKILL_MD_URL =
  "https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md";

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
