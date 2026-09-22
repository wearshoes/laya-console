export type Locale = "en" | "zh-CN";

export function resolveLocale(cookie: string | undefined, accept: string | null): Locale {
  if (cookie === "zh-CN" || cookie === "en") return cookie;
  if (accept && /zh/i.test(accept)) return "zh-CN";
  return "en";
}

const block = (h: string, p: string, code = "") => ({ h, p, code });

export const en = {
  meta: {
    title: "Laya Console",
    description: "Wearglass Laya console for typed decisions, API keys, usage, and audit.",
  },
  nav: {
    home: "Home",
    playground: "Playground",
    usage: "Usage",
    audit: "Audit",
    keys: "API Keys",
    docs: "Documentation",
    team: "Team",
    billing: "Billing",
    org: "Organization",
    shares: "Shares",
    models: "Models",
    settings: "Settings",
  },
  common: {
    signOut: "Sign out",
    member: "Member",
    admin: "Admin",
    loading: "Loading…",
    close: "Close",
    cancel: "Cancel",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy",
    backHome: "Back to Home",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    skip: "Skip to content",
    commands: "Commands",
    missing: "This page is not in the documentation.",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
  },
  login: {
    welcome: "Welcome to Laya",
    email: "Email",
    password: "Password",
    submit: "Continue",
    submitting: "Continuing…",
    create: "Create an account",
    legal: "By continuing, you agree to the",
    terms: "terms of use",
    and: "and the",
    privacy: "privacy policy",
  },
  register: {
    title: "Create your Laya account",
    name: "Name",
    namePlaceholder: "Optional display name",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    submit: "Create account",
    submitting: "Creating…",
    have: "Already have an account? Sign in",
    mismatch: "Passwords do not match",
    hint: "At least 8 characters. Emails listed in ADMIN_EMAILS become admins.",
    inviteNote: "If this email matches the invite, the new account joins that organization.",
  },
  home: {
    viewExamples: "View example requests",
    learn1: "Learn to",
    learn2: "Laya",
    cta: "Playground",
    v1: "Laya",
    v2: "System One",
    v3: "Typed output",
    inAction: "Laya in action",
    parallelTitle: "Parallel questions",
    parallelBody:
      "Ask several typed questions in one predict call so a support state can return a queue and a policy decision together.",
    cascadeTitle: "Preset cascade",
    cascadeBody:
      "Start with router, then deepen with email or moderation. Each preset is a small structured judgment.",
    cardKicker: "Support desk",
    cardTitle: "Which queue will Laya pick?",
    cardBody: "Triage a refund ticket into urgency and owner.",
    quickstart: "Quickstart",
    agentSetup: "Agent setup",
    copyPrompt: "Copy Agent Prompt",
    skill: "SKILL.md",
    view: "View",
    apiHost: "laya.wearglass.work",
    dataPolicy: "Our Data Policy",
    trust: "Trust Center",
    docs: "Documentation",
    apiRef: "API reference",
    apiKey: "API key",
    help: "Help us improve Laya",
    triage: "Triage",
    guard: "Guard",
    triageQ: "How urgent is this ticket?",
    guardQ: "Is it safe to answer?",
    allCookbooks: "All cookbooks",
    playDemo: "Play demo",
    cookbooks: "Cookbooks",
    demos: "Demos",
    github: "Join us on GitHub",
    replay: "Replay intro",
  },
  presets: {
    triage: {
      label: "Triage",
      hint: "Classify urgency and queue",
      example: "How urgent is this refund request?",
      blurb: "Bucket a support state into urgency and a queue.",
    },
    email: {
      label: "Email",
      hint: "Route an inbox thread",
      example: "Which queue should this email land in?",
      blurb: "Judge inbox routing from subject and body.",
    },
    guard: {
      label: "Guard",
      hint: "Policy check before a reply",
      example: "Is it safe to answer this?",
      blurb: "Fast policy check before an assistant reply.",
    },
    moderation: {
      label: "Moderation",
      hint: "Content policy judgment",
      example: "Does this post violate policy?",
      blurb: "Typed moderation decision on user content.",
    },
    router: {
      label: "Router",
      hint: "Pick the next tool",
      example: "Which tool should handle this?",
      blurb: "Route a request to the right tool or agent.",
    },
  },
  playground: {
    title: "Playground",
    clear: "Clear",
    share: "Share",
    shared: "Share link copied",
    shareBody: "The public page shows this preset and state. It never includes an API key.",
    createLink: "Create link",
    state: "State",
    ready: "No issues blocking Run",
    invalid: "Invalid JSON",
    questions: "Questions",
    format: "Format",
    select: "Select preset",
    docs: "Docs",
    custom: "Custom questions JSON",
    placeholder: '[{"type":"choice","prompt":"...","options":["a","b"]}]',
    runtime: "laya-latest",
    run: "Run",
    running: "Running…",
    examples: "Example requests",
    learn: "Learn to Laya",
    walkthrough: "Walkthrough lessons",
    cases: "Real-life use cases",
    response: "Response",
    cards: "Cards",
    plain: "Plain text",
    json: "JSON",
    back: "Examples",
    empty: "Run a prediction to see the response here.",
    session: "Signed-in session",
  },
  cases: {
    triage: "Assess an inbound support ticket",
    email: "Sort a billing email",
    guard: "Check a draft reply",
    moderation: "Review a user comment",
    router: "Pick the next agent tool",
  },
  usage: {
    title: "Usage",
    delayed: "Stats may be delayed",
    allTraffic: "All traffic",
    errors: "Errors",
    allPresets: "All presets",
    preset: "Preset",
    last7: "Last 7 days",
    last30: "Last 30 days",
    last60: "Last 60 days",
    daily: "Daily",
    requests: "Requests",
    successful: "Successful",
    latency: "Avg latency",
    export: "Export",
    empty: "No requests in this range yet. Run Playground or call /v1/predict.",
    scopeAll: "All accounts",
    scopeOwn: "Your account",
    account: "Account",
    allAccounts: "All accounts",
    sqlite: "Counts come from this console's audit log. There is no token billing.",
    ms: "ms",
  },
  keys: {
    title: "API keys",
    create: "Create key",
    search: "Search keys…",
    name: "Name",
    status: "Status",
    secret: "Secret key",
    createdBy: "Created by",
    created: "Created",
    active: "Active",
    revoked: "Revoked",
    revoke: "Revoke",
    revokeConfirm: "Revoke this key?",
    revokeBody: "Calls that use this secret will be rejected. The secret is not stored, and this cannot be undone.",
    empty: "No keys yet. Create one to call /v1/predict.",
    footer: "API keys are organization-scoped and remain active even after the creator is removed.",
    modalTitle: "Create API key",
    modalBody: "API keys are organization-scoped and remain active even after the creator is removed.",
    keyName: "Key name",
    placeholder: "e.g., Production key",
    revealTitle: "Copy your secret",
    revealBody: "This secret is shown once. Laya Console stores only a SHA-256 hash.",
    saved: "I've saved it",
    own: "You manage keys for your own account.",
  },
  audit: {
    title: "Audit",
    lede: "Every model call is recorded before it reaches upstream Laya. Secrets are never stored.",
    search: "Search route, account, preset, body…",
    account: "Account",
    allAccounts: "All accounts",
    apiKey: "API key",
    allKeys: "All keys",
    session: "Playground session",
    status: "Status",
    anyStatus: "Any status",
    from: "From",
    to: "To",
    kind: "Kind",
    allKinds: "All events",
    model: "Model calls",
    auth: "Auth failures",
    time: "Time",
    route: "Route",
    preset: "Preset",
    latency: "Latency",
    empty: "No audit events match these filters.",
    pending: "Pending",
    authFailure: "Auth failure",
    detail: "Event",
    request: "Request body",
    response: "Response body",
    noBody: "No body stored",
    expand: "Expand",
    collapse: "Collapse",
    ip: "IP",
    ua: "User agent",
    prev: "Previous",
    next: "Next",
    showing: "Showing",
    of: "of",
  },
  admin: {
    title: "Team",
    lede: "Admins can review every account. Members only see their own keys, usage, and playground.",
    email: "Email",
    name: "Name",
    org: "Organization",
    role: "Role",
    you: "You",
    saved: "Role updated",
  },
  forbidden: {
    code: "403",
    title: "You don't have access",
    body: "Audit and team management are limited to admin accounts. Members can use Home, Playground, Usage, API Keys, and Documentation.",
  },
  legal: {
    termsTitle: "Terms of use",
    termsBody:
      "Laya Console is a Wearglass control panel for the Laya decision API. Use it only with data you are allowed to send. API keys are credentials; treat a revealed secret like a password.",
    privacyTitle: "Data policy",
    privacyBody:
      "The console stores your email, display name, organization, role, and a scrypt password hash. API keys are stored as a SHA-256 hash plus a short prefix. Audit records keep request and response JSON, route, preset, status, latency, IP, and user agent. The raw API secret and the upstream key are not written to the audit log.",
    trustTitle: "Trust Center",
    trustBody:
      "Sign-in uses an httpOnly session cookie. Public predict routes require your X-API-Key. Revoked keys stop working immediately. Only admins can open the audit trail.",
    back: "Back to sign in",
  },
  errors: {
    invalid_credentials: "Email or password is incorrect",
    invalid_email: "Enter a valid email",
    password_short: "Use at least 8 characters",
    email_taken: "An account with that email already exists",
    invalid_json: "Request JSON could not be parsed",
    missing_state: "State is required",
    unknown_preset: "Unknown preset",
    missing_api_key: "X-API-Key is required",
    invalid_api_key: "API key is invalid or revoked",
    audit_failed: "Audit gateway failed, so the model was not called",
    upstream_unreachable: "Upstream Laya could not be reached",
    invalid_upstream_json: "Upstream returned invalid JSON",
    unauthorized: "Sign in required",
    forbidden: "Admin access required",
    not_found: "Not found",
    last_admin: "Cannot remove the last admin",
    invalid_role: "Role must be member or admin",
    generic: "Something went wrong",
  },
  docs: {
    onThisPage: "On this page",
    search: "Search docs",
    noResults: "No matching pages",
    signIn: "Sign in",
    quickstart: {
      title: "Quickstart",
      lede: "Create an account, mint a console API key, and send a typed decision to Laya.",
      blocks: [
        block(
          "Create an account",
          "Register with email and password. New users are members. An email listed in the server ADMIN_EMAILS variable is signed in as an admin and can open Audit and Team."
        ),
        block(
          "Create an API key",
          "Open API Keys, name the key, and copy the laya_ secret when it is shown. The console keeps only a SHA-256 hash and a short prefix. You will not be able to see the secret again."
        ),
        block(
          "Call predict",
          "Send state to this console. Your console key is checked, an audit row is written, then the call is proxied to the upstream Laya API. Do not put the upstream key in client code.",
          `curl -sS "$ORIGIN/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: laya_your_key" \\
  -d '{"state":{"text":"order never arrived"},"preset":"triage"}'`
        ),
        block(
          "Optional skill install",
          "Agents can install the Wearglass Laya skill. This is optional. The console API works without it. One install path is npx skills add wearshoes/laya-skills --skill laya-ai. The skill repository is an install option: https://github.com/wearshoes/laya-skills"
        ),
        block(
          "Try it in the playground",
          "Playground runs the same gateway with your session instead of an API key. Pick a preset, edit state JSON, and run. Admins can inspect the recorded request on the Audit page."
        ),
      ],
    },
    api: {
      title: "API reference",
      lede: "Predict endpoints on this console. Both paths share the same handler.",
      blocks: [
        block(
          "Endpoints",
          "POST /v1/predict and POST /predict. GET /health returns a small liveness payload and does not call the model.",
          `POST /v1/predict
POST /predict
GET /health`
        ),
        block(
          "Authentication",
          "Send the console secret in the X-API-Key header, or as Authorization: Bearer. The raw secret is hashed with SHA-256 and matched to a stored hash. A missing, unknown, or revoked key is rejected before the model is called. Those failures are logged without the request body and without the raw secret."
        ),
        block(
          "Body",
          "state is required and can be any JSON value. preset selects a built-in question set and defaults to triage. questions, when present, is forwarded as a custom question list. Unknown presets are rejected when questions is omitted.",
          `{
  "state": { "text": "order never arrived", "channel": "support" },
  "preset": "triage"
}`
        ),
        block(
          "What the console does",
          "The handler writes an audit record first. If that write fails, upstream is not called. Otherwise the console posts the same JSON to LAYA_UPSTREAM_URL using LAYA_UPSTREAM_API_KEY from the server environment, then stores status, latency, and the response."
        ),
        block(
          "Status codes",
          "200-class codes come from upstream. 400 means invalid JSON, missing state, or an unknown preset. 401 means the caller key was missing or not accepted. 502 means upstream could not be reached. 503 means the audit gateway could not store the request."
        ),
      ],
    },
    keys: {
      title: "API keys",
      lede: "Keys belong to the signed-in user. Members and admins each manage their own keys.",
      blocks: [
        block(
          "Create and reveal once",
          "Choose a name such as Production key. The response includes the full laya_ secret a single time. After you dismiss it, the console can only show the prefix."
        ),
        block(
          "Storage",
          "The database stores key id, name, prefix, SHA-256 hash, owner, and revoked flag. It does not store the secret. Audit rows store key id, prefix, and name only."
        ),
        block(
          "Revoke",
          "Revoking a key marks it inactive. Later predict calls with that secret fail authentication and do not reach the model."
        ),
        block(
          "Scope",
          "Keys stay active for the organization even if you later change the display name. A member cannot list or revoke another account's keys."
        ),
      ],
    },
    presets: {
      title: "Presets",
      lede: "Presets are small typed judgments. Pass one in the preset field, or send your own questions array.",
      blocks: [
        block(
          "triage",
          "Classify a support state into urgency and a queue.",
          `{
  "state": {
    "text": "Customer says their order never arrived and wants a refund immediately.",
    "channel": "support"
  },
  "preset": "triage"
}`
        ),
        block(
          "email",
          "Route an inbox thread from subject, body, and sender.",
          `{
  "state": {
    "subject": "Refund for order #1842",
    "body": "I was charged twice and need this reversed today.",
    "from": "sam@example.com"
  },
  "preset": "email"
}`
        ),
        block(
          "guard",
          "Check a draft against a policy before it is sent.",
          `{
  "state": {
    "draft": "I can share the customer's password reset link with you.",
    "policy": "do not disclose credentials or account secrets"
  },
  "preset": "guard"
}`
        ),
        block(
          "moderation",
          "Judge whether user content should be acted on.",
          `{
  "state": {
    "text": "This update is disappointing and the team should be ashamed.",
    "surface": "comment"
  },
  "preset": "moderation"
}`
        ),
        block(
          "router",
          "Choose the next tool or agent for a request.",
          `{
  "state": {
    "text": "Look up order 1842 and draft a refund reply.",
    "tools": ["orders.lookup", "billing.refund", "email.draft"]
  },
  "preset": "router"
}`
        ),
      ],
    },
    skill: {
      title: "Skill",
      lede: "Optional agent skill for Wearglass Laya. The console API works without it.",
      blocks: [
        block(
          "What the skill does",
          "The Laya skill teaches coding agents how to call this console with typed state and presets. It does not replace API keys or the playground."
        ),
        block(
          "Install",
          "Use one install path. Claude Code: claude plugin marketplace add wearshoes/laya-skills, then claude plugin install laya-ai@wearshoes/laya-skills. Other agents: npx skills add wearshoes/laya-skills --skill laya-ai.",
          `npx skills add wearshoes/laya-skills --skill laya-ai`
        ),
        block(
          "Read the skill",
          "SKILL.md lives in the public skill repository. Point agents at it when you want them to draft predict calls against this console.",
          `https://github.com/wearshoes/laya-skills
https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md`
        ),
        block(
          "Runtime pairing",
          "Set LAYA_API_KEY to a console key from API Keys. Prefer this console origin for predict so audit and usage stay in one place."
        ),
      ],
    },
  },
  product: {
    billingTitle: "Billing",
    billingLede: "Preview only. This console does not charge a card or move money.",
    plan: "Plan",
    planName: "Developer preview",
    amountDue: "Amount due",
    credits: "Included preview credits",
    used: "Credits charged",
    requests: "Metered requests",
    notBilled: "Not billed",
    addCredits: "Add credits",
    disabledTitle: "Payments are off",
    disabledBody: "No payment method is collected. Add credits does not create a charge.",
    invoices: "Invoices",
    invoicesEmpty: "No invoices. Nothing has been billed.",
    orgTitle: "Organization",
    orgLede: "Members share an organization name. Invites stay inside this console until someone registers with the same email.",
    members: "Members",
    invite: "Invite a member",
    inviteEmail: "Email to invite",
    createInvite: "Create invite",
    inviteLink: "Invite link",
    pending: "Pending invites",
    accepted: "Accepted",
    sharesTitle: "Shares",
    sharesLede: "A share is a named preset and state snapshot. It never includes an API secret.",
    shareTitle: "Title",
    createShare: "Create share",
    open: "Open",
    revoke: "Revoke",
    emptyShares: "No shares yet.",
    feedback: "Feedback",
    feedbackLede: "Saved in this console's database only.",
    category: "Category",
    bug: "Bug",
    idea: "Idea",
    other: "Other",
    message: "Message",
    send: "Save feedback",
    sent: "Saved. Nothing was sent to a payment provider or a third party.",
    modelsTitle: "Models",
    modelsLede: "Laya Console currently routes every playground and predict call through one decision runtime.",
    runtime: "Runtime",
    palettePlaceholder: "Jump to a page…",
    paletteEmpty: "No matching commands",
    groupStart: "Start",
    groupReference: "Reference",
    groupProduct: "Product",
    groupLegal: "Legal",
  },
  settings: {
    title: "Settings",
    lede: "Profile and appearance for this console.",
    name: "Display name",
    email: "Email",
    save: "Save profile",
    saved: "Saved",
    themeLede: "Stored in this browser as light or dark. It does not change your account role.",
  },
};

export type Dict = typeof en;

export const zhCN: Dict = {
  meta: {
    title: "Laya 控制台",
    description: "Wearglass Laya 控制台：类型化决策、API 密钥、用量与审计。",
  },
  nav: {
    home: "首页",
    playground: "试验场",
    usage: "用量",
    audit: "审计",
    keys: "API 密钥",
    docs: "文档",
    team: "团队",
    billing: "账单",
    org: "组织",
    shares: "分享",
    models: "模型",
    settings: "设置",
  },
  common: {
    signOut: "退出登录",
    member: "成员",
    admin: "管理员",
    loading: "加载中…",
    close: "关闭",
    cancel: "取消",
    copy: "复制",
    copied: "已复制",
    copyFailed: "复制失败",
    backHome: "返回首页",
    language: "语言",
    theme: "主题",
    themeLight: "浅色",
    themeDark: "深色",
    skip: "跳到内容",
    commands: "命令",
    missing: "文档里没有这一页。",
    collapseSidebar: "收起侧栏",
    expandSidebar: "展开侧栏",
  },
  login: {
    welcome: "欢迎使用 Laya",
    email: "邮箱",
    password: "密码",
    submit: "继续",
    submitting: "正在继续…",
    create: "创建账户",
    legal: "继续即表示你同意",
    terms: "使用条款",
    and: "和",
    privacy: "隐私政策",
  },
  register: {
    title: "创建 Laya 账户",
    name: "姓名",
    namePlaceholder: "可选的显示名称",
    email: "邮箱",
    password: "密码",
    confirm: "确认密码",
    submit: "创建账户",
    submitting: "正在创建…",
    have: "已有账户？去登录",
    mismatch: "两次输入的密码不一致",
    hint: "至少 8 个字符。写在服务器 ADMIN_EMAILS 里的邮箱会成为管理员。",
    inviteNote: "如果邮箱与邀请一致，新账号会加入该组织。",
  },
  home: {
    viewExamples: "查看示例请求",
    learn1: "学习",
    learn2: "Laya",
    cta: "试验场",
    v1: "Laya",
    v2: "System One",
    v3: "类型化输出",
    inAction: "Laya 实战应用",
    parallelTitle: "并行问题",
    parallelBody: "一次 predict 可以提出多个类型化问题，让一条客服状态同时返回队列和策略判断。",
    cascadeTitle: "预设级联",
    cascadeBody: "先用 router，再用 email 或 moderation 加深。每个预设都是一次短小的结构化判断。",
    cardKicker: "支持台",
    cardTitle: "Laya 会把它分到哪个队列？",
    cardBody: "把退款工单判断成紧急程度和负责人。",
    quickstart: "快速开始",
    agentSetup: "代理安装",
    copyPrompt: "复制代理提示",
    skill: "SKILL.md",
    view: "查看",
    apiHost: "laya.wearglass.work",
    dataPolicy: "数据政策",
    trust: "信任中心",
    docs: "文档",
    apiRef: "API 参考",
    apiKey: "API 密钥",
    help: "帮助改进 Laya",
    triage: "分诊",
    guard: "防护",
    triageQ: "这张工单有多紧急？",
    guardQ: "这样回复安全吗？",
    allCookbooks: "全部做法",
    playDemo: "播放演示",
    cookbooks: "做法",
    demos: "演示",
    github: "加入 GitHub",
    replay: "重看介绍",
  },
  presets: {
    triage: {
      label: "分诊",
      hint: "判断紧急程度和队列",
      example: "这个退款请求有多紧急？",
      blurb: "把客服状态放进紧急程度和队列。",
    },
    email: {
      label: "邮件",
      hint: "路由收件箱线程",
      example: "这封邮件该进哪个队列？",
      blurb: "根据主题和正文判断收件箱路由。",
    },
    guard: {
      label: "防护",
      hint: "回复前的策略检查",
      example: "这样回复安全吗？",
      blurb: "在助手回复之前做一次快速策略检查。",
    },
    moderation: {
      label: "审核",
      hint: "内容策略判断",
      example: "这条内容是否违规？",
      blurb: "对用户内容给出类型化审核结论。",
    },
    router: {
      label: "路由",
      hint: "选择下一个工具",
      example: "该由哪个工具处理？",
      blurb: "把请求交给合适的工具或代理。",
    },
  },
  playground: {
    title: "试验场",
    clear: "清空",
    share: "分享",
    shared: "分享链接已复制",
    shareBody: "公开页只显示这份预设和状态，绝不包含 API 密钥。",
    createLink: "创建链接",
    state: "状态",
    ready: "没有阻止运行的问题",
    invalid: "JSON 无效",
    questions: "问题",
    format: "格式化",
    select: "选择预设",
    docs: "文档",
    custom: "自定义问题 JSON",
    placeholder: '[{"type":"choice","prompt":"...","options":["a","b"]}]',
    runtime: "laya-latest",
    run: "运行",
    running: "运行中…",
    examples: "示例请求",
    learn: "学习 Laya",
    walkthrough: "演示课程",
    cases: "真实场景",
    response: "响应",
    cards: "卡片",
    plain: "纯文本",
    json: "JSON",
    back: "示例",
    empty: "运行一次预测后，响应会显示在这里。",
    session: "当前登录会话",
  },
  cases: {
    triage: "评估一条入站客服工单",
    email: "分拣一封账单邮件",
    guard: "检查一份回复草稿",
    moderation: "审核一条用户评论",
    router: "选择下一个代理工具",
  },
  usage: {
    title: "用量",
    delayed: "统计可能有延迟",
    allTraffic: "全部流量",
    errors: "错误",
    allPresets: "全部预设",
    preset: "预设",
    last7: "最近 7 天",
    last30: "最近 30 天",
    last60: "最近 60 天",
    daily: "按天",
    requests: "请求",
    successful: "成功",
    latency: "平均延迟",
    export: "导出",
    empty: "这个范围内还没有请求。可以在试验场运行，或调用 /v1/predict。",
    scopeAll: "全部账户",
    scopeOwn: "你的账户",
    account: "账户",
    allAccounts: "全部账户",
    sqlite: "计数来自本控制台的审计日志，没有按 token 计费。",
    ms: "毫秒",
  },
  keys: {
    title: "API 密钥",
    create: "创建密钥",
    search: "搜索密钥…",
    name: "名称",
    status: "状态",
    secret: "密钥",
    createdBy: "创建者",
    created: "创建时间",
    active: "有效",
    revoked: "已吊销",
    revoke: "吊销",
    revokeConfirm: "吊销这把密钥？",
    revokeBody: "使用该密钥的调用会被拒绝。密钥原文并未保存，此操作不能撤销。",
    empty: "还没有密钥。创建一把之后即可调用 /v1/predict。",
    footer: "API 密钥属于组织，创建者被移除后仍然有效。",
    modalTitle: "创建 API 密钥",
    modalBody: "API 密钥属于组织，创建者被移除后仍然有效。",
    keyName: "密钥名称",
    placeholder: "例如：Production key",
    revealTitle: "复制你的密钥",
    revealBody: "密钥只显示这一次。控制台只保存 SHA-256 哈希。",
    saved: "我已保存",
    own: "你只能管理自己账户的密钥。",
  },
  audit: {
    title: "审计",
    lede: "每次模型调用都会先写入审计，再转发到上游 Laya。密钥原文不会被保存。",
    search: "搜索路由、账户、预设、正文…",
    account: "账户",
    allAccounts: "全部账户",
    apiKey: "API 密钥",
    allKeys: "全部密钥",
    session: "试验场会话",
    status: "状态",
    anyStatus: "任意状态",
    from: "开始",
    to: "结束",
    kind: "类型",
    allKinds: "全部事件",
    model: "模型调用",
    auth: "认证失败",
    time: "时间",
    route: "路由",
    preset: "预设",
    latency: "延迟",
    empty: "没有符合筛选条件的审计事件。",
    pending: "进行中",
    authFailure: "认证失败",
    detail: "事件",
    request: "请求体",
    response: "响应体",
    noBody: "未保存正文",
    expand: "展开",
    collapse: "收起",
    ip: "IP",
    ua: "User-Agent",
    prev: "上一页",
    next: "下一页",
    showing: "显示",
    of: "/",
  },
  admin: {
    title: "团队",
    lede: "管理员可以查看所有账户。成员只能看到自己的密钥、用量和试验场。",
    email: "邮箱",
    name: "姓名",
    org: "组织",
    role: "角色",
    you: "你",
    saved: "角色已更新",
  },
  forbidden: {
    code: "403",
    title: "没有访问权限",
    body: "审计和团队管理仅对管理员开放。成员可以使用首页、试验场、用量、API 密钥和文档。",
  },
  legal: {
    termsTitle: "使用条款",
    termsBody:
      "Laya 控制台是 Wearglass 为 Laya 决策 API 提供的控制面板。请只提交你有权发送的数据。API 密钥是凭证，显示过的密钥应像密码一样保管。",
    privacyTitle: "数据政策",
    privacyBody:
      "控制台保存邮箱、显示名、组织、角色，以及 scrypt 密码哈希。API 密钥只保存 SHA-256 哈希和短前缀。审计记录包含请求与响应 JSON、路由、预设、状态、延迟、IP 和 User-Agent。API 密钥原文和上游密钥不会写入审计日志。",
    trustTitle: "信任中心",
    trustBody:
      "登录使用 httpOnly 会话 Cookie。公开的 predict 路由需要你的 X-API-Key。吊销后的密钥会立即失效。只有管理员可以打开审计记录。",
    back: "返回登录",
  },
  errors: {
    invalid_credentials: "邮箱或密码不正确",
    invalid_email: "请输入有效邮箱",
    password_short: "至少使用 8 个字符",
    email_taken: "这个邮箱已经注册",
    invalid_json: "无法解析请求 JSON",
    missing_state: "必须提供 state",
    unknown_preset: "未知预设",
    missing_api_key: "需要 X-API-Key",
    invalid_api_key: "API 密钥无效或已吊销",
    audit_failed: "审计网关写入失败，因此没有调用模型",
    upstream_unreachable: "无法连接上游 Laya",
    invalid_upstream_json: "上游返回的不是有效 JSON",
    unauthorized: "需要登录",
    forbidden: "需要管理员权限",
    not_found: "未找到",
    last_admin: "不能移除最后一位管理员",
    invalid_role: "角色只能是成员或管理员",
    generic: "出了点问题",
  },
  docs: {
    onThisPage: "本页目录",
    search: "搜索文档",
    noResults: "没有匹配的页面",
    signIn: "登录",
    quickstart: {
      title: "快速开始",
      lede: "创建账户，签发控制台 API 密钥，然后向 Laya 发送一次类型化决策。",
      blocks: [
        block(
          "创建账户",
          "使用邮箱和密码注册。新用户默认是成员。写在服务器环境变量 ADMIN_EMAILS 中的邮箱会以管理员身份登录，并可以打开审计和团队。"
        ),
        block(
          "创建 API 密钥",
          "打开 API 密钥，为密钥命名，并在显示时复制 laya_ 开头的密钥。控制台只保留 SHA-256 哈希和短前缀。关闭之后无法再次查看原文。"
        ),
        block(
          "调用 predict",
          "把 state 发送到这个控制台。控制台会校验你的密钥，先写审计记录，再代理到上游 Laya API。不要把上游密钥放到客户端代码里。",
          `curl -sS "$ORIGIN/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: laya_your_key" \\
  -d '{"state":{"text":"order never arrived"},"preset":"triage"}'`
        ),
        block(
          "可选的技能安装",
          "代理可以安装 Wearglass 的 Laya 技能。这是可选项，不用它也能调用控制台 API。一种安装方式是 npx skills add wearshoes/laya-skills --skill laya-ai。技能仓库只是安装入口：https://github.com/wearshoes/laya-skills"
        ),
        block(
          "在试验场试一次",
          "试验场走同一条网关，用登录会话而不是 API 密钥。选择预设、编辑状态 JSON，然后运行。管理员可以在审计页查看记下的请求。"
        ),
      ],
    },
    api: {
      title: "API 参考",
      lede: "本控制台的 predict 接口。两条路径使用同一个处理程序。",
      blocks: [
        block(
          "端点",
          "POST /v1/predict 和 POST /predict。GET /health 只返回存活信息，不会调用模型。",
          `POST /v1/predict
POST /predict
GET /health`
        ),
        block(
          "认证",
          "在 X-API-Key 头中发送控制台密钥，或使用 Authorization: Bearer。原文会用 SHA-256 哈希后与库存哈希比对。缺失、未知或已吊销的密钥会在调用模型之前被拒绝。这类失败会记入审计，但不保存请求体，也不保存密钥原文。"
        ),
        block(
          "请求体",
          "state 必填，可以是任意 JSON。preset 选择内置问题集，默认 triage。如果提供 questions，会作为自定义问题列表转发。未提供 questions 时，未知 preset 会被拒绝。",
          `{
  "state": { "text": "order never arrived", "channel": "support" },
  "preset": "triage"
}`
        ),
        block(
          "控制台会做什么",
          "处理程序会先写审计记录。如果写入失败，就不会调用上游。否则控制台把同一份 JSON 发到环境变量 LAYA_UPSTREAM_URL，并使用服务器上的 LAYA_UPSTREAM_API_KEY，然后保存状态码、延迟和响应。"
        ),
        block(
          "状态码",
          "2xx 来自上游。400 表示 JSON 无效、缺少 state 或预设未知。401 表示调用方密钥缺失或未被接受。502 表示无法连接上游。503 表示审计网关没能记下这次请求。"
        ),
      ],
    },
    keys: {
      title: "API 密钥",
      lede: "密钥属于当前登录用户。成员和管理员各自管理自己的密钥。",
      blocks: [
        block(
          "创建并只显示一次",
          "起一个名字，例如 Production key。响应里会包含完整的 laya_ 密钥，而且只此一次。关闭之后，控制台只能显示前缀。"
        ),
        block(
          "存储",
          "数据库保存密钥 id、名称、前缀、SHA-256 哈希、所有者和吊销标记，不保存密钥原文。审计行只保存密钥 id、前缀和名称。"
        ),
        block(
          "吊销",
          "吊销会把密钥标为失效。之后再用这把密钥调用 predict 会认证失败，不会到达模型。"
        ),
        block(
          "范围",
          "即使以后修改显示名，密钥仍然属于该组织并保持有效。成员不能列出或吊销其他账户的密钥。"
        ),
      ],
    },
    presets: {
      title: "预设",
      lede: "预设是短小的类型化判断。在 preset 字段里传入其中一个，或自行发送 questions 数组。",
      blocks: [
        block(
          "triage",
          "把客服状态分成紧急程度和队列。",
          `{
  "state": {
    "text": "Customer says their order never arrived and wants a refund immediately.",
    "channel": "support"
  },
  "preset": "triage"
}`
        ),
        block(
          "email",
          "根据主题、正文和发件人路由一封邮件。",
          `{
  "state": {
    "subject": "Refund for order #1842",
    "body": "I was charged twice and need this reversed today.",
    "from": "sam@example.com"
  },
  "preset": "email"
}`
        ),
        block(
          "guard",
          "在发送之前对照策略检查一份草稿。",
          `{
  "state": {
    "draft": "I can share the customer's password reset link with you.",
    "policy": "do not disclose credentials or account secrets"
  },
  "preset": "guard"
}`
        ),
        block(
          "moderation",
          "判断用户内容是否需要处理。",
          `{
  "state": {
    "text": "This update is disappointing and the team should be ashamed.",
    "surface": "comment"
  },
  "preset": "moderation"
}`
        ),
        block(
          "router",
          "为请求选择下一个工具或代理。",
          `{
  "state": {
    "text": "Look up order 1842 and draft a refund reply.",
    "tools": ["orders.lookup", "billing.refund", "email.draft"]
  },
  "preset": "router"
}`
        ),
      ],
    },
    skill: {
      title: "技能",
      lede: "可选的 Wearglass Laya 代理技能。不用它也能使用控制台 API。",
      blocks: [
        block(
          "技能做什么",
          "Laya 技能教编码代理如何用类型化 state 和预设调用本控制台。它不能替代 API 密钥或试验场。"
        ),
        block(
          "安装",
          "只用一种安装路径。Claude Code：claude plugin marketplace add wearshoes/laya-skills，然后 claude plugin install laya-ai@wearshoes/laya-skills。其他代理：npx skills add wearshoes/laya-skills --skill laya-ai。",
          `npx skills add wearshoes/laya-skills --skill laya-ai`
        ),
        block(
          "阅读技能",
          "SKILL.md 在公开技能仓库中。需要代理起草对本控制台的 predict 调用时，把仓库指给它。",
          `https://github.com/wearshoes/laya-skills
https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md`
        ),
        block(
          "与运行时配对",
          "把 LAYA_API_KEY 设为 API 密钥页签发的控制台密钥。优先用本控制台的 origin 调用 predict，这样审计和用量会留在同一处。"
        ),
      ],
    },
  },
  product: {
    billingTitle: "账单",
    billingLede: "仅为预览。本控制台不会向银行卡扣款，也不会转移资金。",
    plan: "方案",
    planName: "开发者预览",
    amountDue: "应付金额",
    credits: "包含的预览额度",
    used: "已扣额度",
    requests: "计量请求",
    notBilled: "未计费",
    addCredits: "增加额度",
    disabledTitle: "支付已关闭",
    disabledBody: "不会收集支付方式。增加额度不会产生扣款。",
    invoices: "发票",
    invoicesEmpty: "没有发票。尚未发生任何扣费。",
    orgTitle: "组织",
    orgLede: "成员共用一个组织名。邀请只保存在本控制台，对方用同一邮箱注册后才会加入。",
    members: "成员",
    invite: "邀请成员",
    inviteEmail: "受邀邮箱",
    createInvite: "创建邀请",
    inviteLink: "邀请链接",
    pending: "待接受的邀请",
    accepted: "已接受",
    sharesTitle: "分享",
    sharesLede: "分享是一份预设和状态快照，绝不包含 API 密钥。",
    shareTitle: "标题",
    createShare: "创建分享",
    open: "打开",
    revoke: "撤销",
    emptyShares: "还没有分享。",
    feedback: "反馈",
    feedbackLede: "只保存在本控制台的数据库里。",
    category: "类别",
    bug: "缺陷",
    idea: "想法",
    other: "其他",
    message: "内容",
    send: "保存反馈",
    sent: "已保存。没有发送给支付机构或第三方。",
    modelsTitle: "模型",
    modelsLede: "试验场和 predict 目前都走同一个决策运行时。",
    runtime: "运行时",
    palettePlaceholder: "跳转到页面…",
    paletteEmpty: "没有匹配的命令",
    groupStart: "开始",
    groupReference: "参考",
    groupProduct: "产品",
    groupLegal: "法律",
  },
  settings: {
    title: "设置",
    lede: "本控制台的个人资料和外观。",
    name: "显示名称",
    email: "邮箱",
    save: "保存资料",
    saved: "已保存",
    themeLede: "保存在这台浏览器里，分为浅色和深色。不会改变账户角色。",
  },
};

export function lookup(dict: Dict, key: string): string {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const part of parts) {
    if (!cur || typeof cur !== "object" || !(part in cur)) return key;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : key;
}
