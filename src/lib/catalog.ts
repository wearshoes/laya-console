import type { Locale } from "./i18n";

type Copy = Record<Locale, string>;

export type DocBlock = { h: Copy; p: Copy; code?: string };

export type DocPage = {
  id: string;
  group: "start" | "reference" | "product" | "legal";
  href: string;
  title: Copy;
  lede: Copy;
  blocks: DocBlock[];
};

const enzh = (en: string, zh: string): Copy => ({ en, "zh-CN": zh });

export const DOC_PAGES: DocPage[] = [
  {
    id: "overview",
    group: "start",
    href: "/docs",
    title: enzh("Overview", "概览"),
    lede: enzh(
      "Laya Console is the Wearglass control panel for typed decisions: triage, email routing, guardrails, moderation, and tool routing.",
      "Laya 控制台是 Wearglass 的类型化决策面板，覆盖分诊、邮件路由、防护、审核和工具路由。"
    ),
    blocks: [
      {
        h: enzh("How the console is organized", "控制台如何组织"),
        p: enzh(
          "Start here, then read the predict reference, presets, models, and patterns. Billing, organizations, and shares are product surfaces. Legal notes sit at the end of this list.",
          "从这里开始，然后阅读 predict 参考、预设、模型和模式。账单、组织和分享是产品页面。法律说明在目录末尾。"
        ),
      },
      {
        h: enzh("What is not included", "不包含的内容"),
        p: enzh(
          "The console does not process card payments. Credit balances on the billing page are a non-charging preview. Upstream credentials stay in server environment variables.",
          "控制台不处理银行卡支付。账单页上的额度是不扣费的预览。上游凭证只放在服务器环境变量里。"
        ),
      },
      {
        h: enzh("A first request", "第一次请求"),
        p: enzh(
          "After you create a key, send state and a preset. The console checks the key, writes an audit row, then proxies the body.",
          "创建密钥后，发送 state 和一个预设。控制台会校验密钥、写入审计，再转发请求体。"
        ),
        code: `curl -sS "$ORIGIN/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: laya_your_key" \\
  -d '{"state":{"text":"order never arrived"},"preset":"triage"}'`,
      },
    ],
  },
  {
    id: "models",
    group: "start",
    href: "/docs/models",
    title: enzh("Models", "模型"),
    lede: enzh(
      "One decision runtime serves playground sessions and API keys.",
      "试验场会话和 API 密钥使用同一个决策运行时。"
    ),
    blocks: [
      {
        h: enzh("laya-latest", "laya-latest"),
        p: enzh(
          "laya-latest is the console label for the current Laya decision runtime. It returns typed judgments for the built-in presets. It is not a chat model and it does not bill tokens.",
          "laya-latest 是当前 Laya 决策运行时在控制台中的名称。它为内置预设返回类型化判断。它不是聊天模型，也不按 token 计费。"
        ),
        code: `{ "runtime": "laya-latest", "presets": ["triage", "email", "guard", "moderation", "router"] }`,
      },
      {
        h: enzh("Where it runs", "它在哪里运行"),
        p: enzh(
          "The console writes an audit row, then proxies the body to LAYA_UPSTREAM_URL. Callers use their own laya_ key. They never send the upstream key.",
          "控制台先写审计记录，再把请求体代理到 LAYA_UPSTREAM_URL。调用方使用自己的 laya_ 密钥，从不发送上游密钥。"
        ),
      },
    ],
  },
  {
    id: "patterns",
    group: "start",
    href: "/docs/patterns",
    title: enzh("Patterns", "模式"),
    lede: enzh(
      "Small compositions on top of presets. Each one is a console recipe, not a copied product walkthrough.",
      "预设之上的小型组合。每一条都是控制台自己的做法。"
    ),
    blocks: [
      {
        h: enzh("Parallel questions", "并行问题"),
        p: enzh(
          "Send one state and a questions array when you need a queue and a policy decision together. The playground can also run a single preset first.",
          "当需要同时得到队列和策略判断时，发送一份 state 和一个 questions 数组。试验场也可以先跑单个预设。"
        ),
      },
      {
        h: enzh("Preset cascade", "预设级联"),
        p: enzh(
          "Call router, then call email or moderation with the same state. Keep each call small so the audit trail stays readable.",
          "先调用 router，再用同一份 state 调用 email 或 moderation。每次调用保持短小，审计记录才容易读。"
        ),
      },
      {
        h: enzh("Share a snapshot", "分享快照"),
        p: enzh(
          "Save a preset and state as a share. The public link shows JSON only. It does not include an API key.",
          "把预设和状态存成分享。公开链接只显示 JSON，不包含 API 密钥。"
        ),
      },
    ],
  },
  {
    id: "authn",
    group: "reference",
    href: "/docs/authn",
    title: enzh("Authentication", "认证"),
    lede: enzh(
      "People sign in with email and password. Programs send X-API-Key.",
      "人使用邮箱和密码登录。程序发送 X-API-Key。"
    ),
    blocks: [
      {
        h: enzh("Console session", "控制台会话"),
        p: enzh(
          "Register and sign-in set an httpOnly cookie. Passwords are stored as scrypt hashes. New accounts are members.",
          "注册和登录会设置 httpOnly Cookie。密码以 scrypt 哈希保存。新账号是成员。"
        ),
      },
      {
        h: enzh("API key", "API 密钥"),
        p: enzh(
          "Send the secret in X-API-Key or Authorization: Bearer. The server compares a SHA-256 hash. A missing or revoked key is rejected before the model runs, and the raw secret is not stored in the audit log.",
          "在 X-API-Key 或 Authorization: Bearer 中发送密钥。服务器比对 SHA-256 哈希。缺失或已吊销的密钥会在模型运行前被拒绝，审计日志不保存密钥原文。"
        ),
      },
    ],
  },
  {
    id: "errors",
    group: "reference",
    href: "/docs/errors",
    title: enzh("Errors", "错误"),
    lede: enzh("Predict errors you can handle without guessing.", "可以明确处理的 predict 错误。"),
    blocks: [
      {
        h: enzh("Status map", "状态对照"),
        p: enzh(
          "400 invalid JSON, missing state, or unknown preset. 401 missing, unknown, or revoked key. 502 upstream could not be reached. 503 the audit row could not be stored, so upstream was not called.",
          "400 表示 JSON 无效、缺少 state 或预设未知。401 表示密钥缺失、未知或已吊销。502 表示无法连接上游。503 表示审计记录没能写入，因此没有调用上游。"
        ),
        code: `{ "ok": false, "error": "missing_state" }`,
      },
    ],
  },
  {
    id: "billing",
    group: "product",
    href: "/docs/billing",
    title: enzh("Billing preview", "账单预览"),
    lede: enzh(
      "The billing screen is a stub. Amount due stays zero.",
      "账单页面是占位。应付金额保持为零。"
    ),
    blocks: [
      {
        h: enzh("No charges", "不会扣款"),
        p: enzh(
          "Add credits explains that payments are disabled. The console does not collect a card number and does not call a payment processor.",
          "增加额度会说明支付已关闭。控制台不收集卡号，也不调用支付机构。"
        ),
      },
    ],
  },
  {
    id: "orgs",
    group: "product",
    href: "/docs/orgs",
    title: enzh("Organizations", "组织"),
    lede: enzh(
      "An organization is the org name stored on each user.",
      "组织就是保存在每个用户上的组织名。"
    ),
    blocks: [
      {
        h: enzh("Members and invites", "成员与邀请"),
        p: enzh(
          "You see people who share your org name. An invite stores an email and a token. The invited person joins that org when they register with the same email. Invites do not send mail by themselves.",
          "你能看到组织名相同的人。邀请会保存邮箱和令牌。对方用同一邮箱注册后加入该组织。邀请本身不会发信。"
        ),
      },
    ],
  },
  {
    id: "shares",
    group: "product",
    href: "/docs/shares",
    title: enzh("Shares", "分享"),
    lede: enzh(
      "Shares publish a preset and a state object.",
      "分享会公开一个预设和一份 state。"
    ),
    blocks: [
      {
        h: enzh("What is stored", "会保存什么"),
        p: enzh(
          "Title, preset, state JSON, owner, and org. Revoking a share hides the public page. API keys are never part of a share.",
          "标题、预设、state JSON、所有者和组织。撤销后公开页不可见。分享里永远没有 API 密钥。"
        ),
      },
    ],
  },
  {
    id: "legal",
    group: "legal",
    href: "/docs/legal",
    title: enzh("Legal", "法律"),
    lede: enzh(
      "Short product notes. The same texts are linked from sign-in.",
      "简短的产品说明。登录页也链到同样的文本。"
    ),
    blocks: [
      {
        h: enzh("Terms", "条款"),
        p: enzh(
          "Use the console only with data you are allowed to send. Treat a revealed laya_ secret like a password. See /legal/terms.",
          "只提交你有权发送的数据。把显示过的 laya_ 密钥当作密码。详见 /legal/terms。"
        ),
      },
      {
        h: enzh("Privacy", "隐私"),
        p: enzh(
          "The database stores email, name, org, role, a scrypt password hash, key hashes, and audit JSON. It does not store raw API secrets or the upstream key. See /legal/privacy.",
          "数据库保存邮箱、姓名、组织、角色、scrypt 密码哈希、密钥哈希和审计 JSON。不保存 API 密钥原文或上游密钥。详见 /legal/privacy。"
        ),
      },
      {
        h: enzh("Trust", "信任"),
        p: enzh(
          "Sessions are httpOnly. Only admins can open Audit. Members see their own keys and usage. See /legal/trust.",
          "会话是 httpOnly。只有管理员能打开审计。成员只能看到自己的密钥和用量。详见 /legal/trust。"
        ),
      },
    ],
  },
];

export const HOME_EDITORIAL = {
  cookbooksTitle: enzh("Cookbooks", "做法"),
  demosTitle: enzh("Demos", "演示"),
  cookbooks: [
    {
      title: enzh("Parallel questions", "并行问题"),
      body: enzh(
        "Ask triage + guard in one predict call so a support state can return a queue and a policy decision together.",
        "一次 predict 同时提出分诊与防护，让一条客服状态同时返回队列和策略判断。"
      ),
    },
    {
      title: enzh("Preset cascade", "预设级联"),
      body: enzh(
        "Router first, then deepen with email or moderation. Each preset is a small structured judgment.",
        "先路由，再用邮件或审核加深。每个预设都是一次短小的结构化判断。"
      ),
    },
    {
      title: enzh("Confidence gate", "置信门槛"),
      body: enzh(
        "Automate high-confidence answers; escalate the rest to a human or deeper model.",
        "高置信度自动处理，其余升级给人工或更深模型。"
      ),
    },
    {
      title: enzh("Inbox router", "收件箱路由"),
      body: enzh(
        "Route sales vs support vs spam with the email preset.",
        "用邮件预设区分销售、支持和垃圾邮件。"
      ),
    },
  ],
  demos: [
    {
      preset: "router" as const,
      title: enzh("Wikirace", "维基竞速"),
      body: enzh("How many hops will Laya take?", "Laya 需要跳几步？"),
      image: "/assets/launchpad/demo-wikirace.svg",
      art: "wide" as const,
    },
    {
      preset: "guard" as const,
      title: enzh("Smarthome", "智能家居"),
      body: enzh("Laya controls appliances", "Laya 控制家电"),
      image: "/assets/launchpad/demo-smart-home.svg",
      art: "compact" as const,
    },
  ],
};

export function tx(copy: Copy, locale: Locale) {
  return copy[locale] || copy.en;
}
