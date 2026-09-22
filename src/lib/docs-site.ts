import type { Locale } from "./i18n";

export type Copy = Record<Locale, string>;

const bi = (en: string, zh: string): Copy => ({ en, "zh-CN": zh });

export function tx(copy: Copy, locale: Locale) {
  return copy[locale] || copy.en;
}

export type Block =
  | { type: "p"; text: Copy }
  | { type: "h2"; text: Copy }
  | { type: "h3"; text: Copy }
  | { type: "ul"; items: Copy[] }
  | { type: "code"; code: string }
  | { type: "callout"; tone: "info" | "note"; text: Copy }
  | { type: "table"; headers: Copy[]; rows: Copy[][] }
  | { type: "flow"; steps: Copy[] };

export type DocEntry = {
  slug: string;
  title: Copy;
  lede: Copy;
  blocks: Block[];
};

const p = (en: string, zh: string): Block => ({ type: "p", text: bi(en, zh) });
const h2 = (en: string, zh: string): Block => ({ type: "h2", text: bi(en, zh) });
const h3 = (en: string, zh: string): Block => ({ type: "h3", text: bi(en, zh) });
const ul = (items: Copy[]): Block => ({ type: "ul", items });
const code = (codeText: string): Block => ({ type: "code", code: codeText });
const info = (en: string, zh: string): Block => ({ type: "callout", tone: "info", text: bi(en, zh) });
const note = (en: string, zh: string): Block => ({ type: "callout", tone: "note", text: bi(en, zh) });
const table = (headers: Copy[], rows: Copy[][]): Block => ({ type: "table", headers, rows });
const flow = (steps: Copy[]): Block => ({ type: "flow", steps });

const PREDICT = `curl -sS "$ORIGIN/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $LAYA_CONSOLE_KEY" \\
  -d '{"state":{"message":"订单三天没发货，想退款"},"preset":"triage"}'`;

export const DOCS_UI = {
  search: bi("Search…", "搜索…"),
  searchLabel: bi("Search docs", "搜索文档"),
  copyPage: bi("Copy page", "复制本页"),
  copied: bi("Copied", "已复制"),
  prev: bi("Previous", "上一页"),
  next: bi("Next", "下一页"),
  onThisPage: bi("On this page", "本页目录"),
  console: bi("Laya console", "Laya 控制台"),
  notFoundTitle: bi("Page not found", "找不到这一页"),
  notFound: bi("This path is not in the Laya docs.", "Laya 文档里没有这个路径。"),
  noResults: bi("No matching pages", "没有匹配的页面"),
  menu: bi("Docs menu", "文档目录"),
  theme: bi("Toggle theme", "切换主题"),
};

export const NAV: { label: Copy; slugs: string[] }[] = [
  { label: bi("Introduction", "介绍"), slugs: ["", "quickstart", "agents"] },
  { label: bi("Primitives", "问题类型"), slugs: ["primitives", "primitives/choice", "primitives/score", "primitives/noul", "primitives/structure"] },
  { label: bi("Concepts", "概念"), slugs: ["concepts/decisions", "concepts/state", "concepts/build"] },
  {
    label: bi("Cookbooks", "做法"),
    slugs: ["cookbooks", "cookbooks/triage", "cookbooks/inbox", "cookbooks/guard", "cookbooks/parallel", "cookbooks/confidence-gate"],
  },
  { label: bi("Patterns", "模式"), slugs: ["patterns", "patterns/fan-out", "patterns/confidence", "patterns/cascade", "patterns/intent"] },
  { label: bi("Confidence and models", "置信与模型"), slugs: ["confidence", "models"] },
  { label: bi("API", "API"), slugs: ["api", "api/auth", "api/errors", "api/keys", "api/presets"] },
  { label: bi("Agent skill", "代理技能"), slugs: ["skill"] },
  { label: bi("Legal", "法律"), slugs: ["legal", "console"] },
];

const PAGES: DocEntry[] = [
  {
    slug: "",
    title: bi("Introduction", "介绍"),
    lede: bi(
      "Laya is Wearglass’s decision model. Send state and typed questions; get structured answers and probabilities your code can branch on. It does not chat.",
      "Laya 是 Wearglass 的决策模型。发送 state 和类型化问题，得到代码可以直接分支的结构化答案和概率。它不聊天。"
    ),
    blocks: [
      p(
        "Large language models are built to write text for people. When your program needs a judgment — which queue, whether a draft is safe, how urgent a ticket is — a text generator is the wrong tool. You would parse prose and hope the shape stays stable.",
        "大语言模型用来给人写文本。当你的程序需要判断——进哪个队列、草稿是否安全、工单有多紧急——文本生成器并不合适。你还得解析散文，并指望格式一直不变。"
      ),
      p(
        "Laya evaluates typed questions against a state and returns structured results in one forward pass. No generated essay, no client SDK required. You send JSON to the predict endpoint, then your code sorts, routes, and escalates.",
        "Laya 对照一份 state 评估类型化问题，一次前向计算返回结构化结果。没有生成式长文，也不强制客户端 SDK。你把 JSON 发到 predict，然后由你的代码去排序、路由和升级。"
      ),
      flow([
        bi("state + questions", "state + 问题"),
        bi("one request", "一次请求"),
        bi("Laya", "Laya"),
        bi("typed answers + probabilities", "类型化答案 + 概率"),
        bi("your code", "你的代码"),
      ]),
      h2("What you send", "你发送什么"),
      p(
        "state is the situation: a string, or a JSON object with named fields such as message, body, or prompt. questions name the judgments you want. If you omit questions, a preset supplies a built-in set.",
        "state 是当前情境：字符串，或带有 message、body、prompt 等具名字段的 JSON 对象。questions 为你要的判断命名。如果省略 questions，预设会提供一套内置问题。"
      ),
      code(PREDICT),
      h2("Question types", "问题类型"),
      ul([
        bi("[Choice](/docs/primitives/choice) picks one option from criteria you define.", "[Choice](/docs/primitives/choice) 从你定义的标准里选一项。"),
        bi("[Score](/docs/primitives/score) rates the state on ordered levels.", "[Score](/docs/primitives/score) 按有序等级给 state 打分。"),
        bi("[Noul](/docs/primitives/noul) answers a yes/no question with a yes-probability.", "[Noul](/docs/primitives/noul) 用“是”的概率回答是非题。"),
      ]),
      info(
        "The console gateway and the hosted Laya API share this JSON body. The console checks your laya_ key, writes an audit row, then proxies the body. It does not add a second question language.",
        "控制台网关和托管的 Laya API 使用同一份 JSON。控制台校验你的 laya_ 密钥，写入审计，再转发请求体。它不会另造一套问题语言。"
      ),
      h2("Where to go next", "接下来看哪里"),
      ul([
        bi("[Quick start](/docs/quickstart) — account, key, first predict.", "[快速开始](/docs/quickstart) — 账户、密钥、第一次 predict。"),
        bi("[Primitives](/docs/primitives) — choice, score, and noul.", "[问题类型](/docs/primitives) — choice、score 和 noul。"),
        bi("[Cookbooks](/docs/cookbooks) — triage, inbox, guard, and parallel calls.", "[做法](/docs/cookbooks) — 分诊、收件箱、防护和并行调用。"),
        bi("[Predict API](/docs/api) — paths, auth, and errors on this console.", "[Predict API](/docs/api) — 本控制台的路径、认证和错误。"),
      ]),
    ],
  },
  {
    slug: "quickstart",
    title: bi("Quick start", "快速开始"),
    lede: bi(
      "Create an account, mint a console API key, and send one typed decision.",
      "创建账户，签发控制台 API 密钥，然后发送一次类型化决策。"
    ),
    blocks: [
      h2("Create an account", "创建账户"),
      p(
        "Register with email and password. New accounts are members of their organization. Sign-in sets an httpOnly session cookie.",
        "用邮箱和密码注册。新账号是其组织的成员。登录会设置 httpOnly 会话 Cookie。"
      ),
      h2("Create an API key", "创建 API 密钥"),
      p(
        "Open API Keys in the console, name the key, and copy the laya_ secret when it is shown. The console stores a SHA-256 hash and a short prefix. The full secret is not shown again.",
        "在控制台打开 API 密钥，命名后在显示时复制 laya_ 密钥。控制台只保存 SHA-256 哈希和短前缀。完整密钥不会再次显示。"
      ),
      h2("Call predict", "调用 predict"),
      p(
        "Send state to this console. Your key is checked, an audit row is written, then the same JSON is proxied upstream. Do not put the upstream key in client code.",
        "把 state 发到本控制台。密钥通过校验后会先写审计，再把同一份 JSON 代理到上游。不要把上游密钥放进客户端代码。"
      ),
      code(PREDICT),
      h2("Or open the playground", "或打开试验场"),
      p(
        "The [playground](/playground) runs the same gateway with your session instead of an API key. Pick a preset, edit state, and run. The right-hand panel lists example requests.",
        "[试验场](/playground) 用登录会话而不是 API 密钥走同一条网关。选择预设、编辑 state 并运行。右侧列出示例请求。"
      ),
      note(
        "Payments are off. A key does not charge a card. Usage charts on the console count audit rows from this deployment.",
        "支付已关闭。密钥不会扣银行卡。控制台上的用量图统计的是本部署的审计记录。"
      ),
    ],
  },
  {
    slug: "agents",
    title: bi("Laya with coding agents", "让编码代理使用 Laya"),
    lede: bi(
      "Agents can install the Laya skill and draft predict calls. The HTTP API works without the skill.",
      "代理可以安装 Laya 技能并起草 predict 调用。不用技能也能使用 HTTP API。"
    ),
    blocks: [
      p(
        "Point an agent at typed decisions when the task is routing, triage, guardrails, or moderation. Ask it to keep side effects in your code and to threshold probabilities itself.",
        "当任务是路由、分诊、防护或审核时，让代理使用类型化决策。要求它把副作用留在你的代码里，并由它自己设定概率门槛。"
      ),
      h2("Install one way", "只选一种安装方式"),
      code(`npx skills add wearshoes/laya-skills --skill laya-ai`),
      p(
        "Claude Code can use the plugin marketplace instead: add wearshoes/laya-skills, then install laya-ai. Do not run both installers.",
        "Claude Code 也可以走插件市场：添加 wearshoes/laya-skills，再安装 laya-ai。不要两种安装器一起跑。"
      ),
      h2("What the agent should call", "代理应该调用什么"),
      ul([
        bi("Console gateway: POST /v1/predict with a console laya_ key.", "控制台网关：用控制台 laya_ 密钥 POST /v1/predict。"),
        bi("Hosted runtime: POST https://laya.wearglass.work/predict with LAYA_API_KEY, same JSON body.", "托管运行时：用 LAYA_API_KEY POST https://laya.wearglass.work/predict，JSON 体相同。"),
      ]),
      p(
        "Read [SKILL.md](https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md) or the [skill page](/docs/skill). The skill repository is an install option, not a second API.",
        "阅读 [SKILL.md](https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md) 或[技能页](/docs/skill)。技能仓库只是安装入口，不是第二套 API。"
      ),
    ],
  },
  {
    slug: "primitives",
    title: bi("Primitives", "问题类型"),
    lede: bi(
      "Three question types cover the judgments Laya returns: choice, score, and noul. Ask several in one predict call.",
      "Laya 返回的判断有三种问题类型：choice、score 和 noul。一次 predict 可以问多个。"
    ),
    blocks: [
      table(
        [bi("Type", "类型"), bi("You supply", "你提供"), bi("You get", "你得到")],
        [
          [bi("choice", "choice"), bi("instructions + named criteria", "说明 + 具名标准"), bi("one selected option and a distribution", "选中的一项以及分布")],
          [bi("score", "score"), bi("instructions + ordered levels", "说明 + 有序等级"), bi("a level and a distribution over levels", "一个等级以及等级上的分布")],
          [bi("noul", "noul"), bi("a yes/no instruction", "一道是非说明"), bi("a probability that the answer is yes", "答案为“是”的概率")],
        ]
      ),
      h2("Named questions", "具名问题"),
      p(
        "questions is an object, not a free-form prompt. Each key is a name your code will read. The value sets type, instructions, and criteria when the type needs them.",
        "questions 是对象，不是自由提示词。每个键是你的代码会读取的名字。值里写明 type、instructions，以及该类型需要的 criteria。"
      ),
      code(`{
  "state": { "message": "订单三天没发货，想退款" },
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "What does the customer want in \`message\`?",
      "criteria": {
        "refund": "money back",
        "technical_help": "bug or outage",
        "other": "none of the above"
      }
    },
    "is_urgent": {
      "type": "noul",
      "instructions": "Does \`message\` communicate time pressure?"
    }
  }
}`),
      info(
        "Backticks in instructions point at state fields. Prefer short field names the question can cite.",
        "说明里的反引号指向 state 字段。字段名宜短，方便问题引用。"
      ),
      h2("Presets versus custom questions", "预设与自定义问题"),
      p(
        "Omit questions and set preset to triage, email, guard, moderation, or router when the built-in set matches the job. Send questions when you need your own labels. Unknown presets are rejected when questions is omitted.",
        "当内置集合符合任务时，省略 questions 并设置 preset 为 triage、email、guard、moderation 或 router。需要自己的标签时再发送 questions。省略 questions 时，未知预设会被拒绝。"
      ),
    ],
  },
  {
    slug: "primitives/choice",
    title: bi("Choice", "Choice"),
    lede: bi(
      "A choice question selects one option from a map of criteria. Your code switches on the option name you defined.",
      "Choice 问题从标准映射里选一项。你的代码按你定义的选项名分支。"
    ),
    blocks: [
      h2("Request", "请求"),
      p(
        "criteria is an object. Keys are the option ids your program understands. Values are short descriptions of what that option means.",
        "criteria 是对象。键是程序认识的选项 id。值是该选项含义的短描述。"
      ),
      code(`{
  "state": { "message": "I was charged twice for order 1842." },
  "questions": {
    "queue": {
      "type": "choice",
      "instructions": "Which queue should handle \`message\`?",
      "criteria": {
        "billing": "payment, refund, or invoice",
        "shipping": "delivery or tracking",
        "other": "none of the above"
      }
    }
  }
}`),
      h2("How to use the answer", "如何使用答案"),
      ul([
        bi("Branch on the option id, not on generated text.", "按选项 id 分支，而不是按生成的文本。"),
        bi("Read the distribution when two options are close, and escalate if your threshold is not met.", "两个选项接近时读取分布；达不到你的门槛就升级。"),
        bi("Keep the option set small. Add an other bucket instead of forcing a bad fit.", "选项集保持小。加一个 other，而不是硬套。"),
      ]),
      note(
        "This console does not ship a typed client for choice results. Parse the JSON body the runtime returns for the question name you sent.",
        "本控制台不提供 choice 结果的类型化客户端。解析运行时按你发送的问题名返回的 JSON。"
      ),
    ],
  },
  {
    slug: "primitives/score",
    title: bi("Score", "Score"),
    lede: bi(
      "A score question rates state against ordered levels you describe. The order is the scale.",
      "Score 问题按你描述的有序等级给 state 打分。顺序就是量尺。"
    ),
    blocks: [
      h2("Request", "请求"),
      p(
        "criteria is an array of level descriptions, from low to high. Instructions say what is being rated and which state field to read.",
        "criteria 是从低到高的等级描述数组。instructions 说明在评什么、读哪个 state 字段。"
      ),
      code(`{
  "state": { "message": "The site is down for all customers." },
  "questions": {
    "urgency": {
      "type": "score",
      "instructions": "How urgent is \`message\`?",
      "criteria": ["no time pressure", "needs attention soon", "blocking"]
    }
  }
}`),
      h2("How to use the answer", "如何使用答案"),
      p(
        "Treat the selected level as a label on your scale. Use the distribution when a ticket sits between two levels. Do not average scores from unrelated questions into one magic number unless you own the weights in code.",
        "把选中的等级当作你量尺上的标签。工单落在两级之间时使用分布。不要把互不相关的问题分数合成一个魔法数字，除非权重写在你的代码里。"
      ),
      info(
        "Three to five levels is enough. Overlapping wording makes neighboring levels hard to separate.",
        "三到五个等级就够了。措辞重叠会让相邻等级难以分开。"
      ),
    ],
  },
  {
    slug: "primitives/noul",
    title: bi("Noul", "Noul"),
    lede: bi(
      "A noul question asks something that is yes or no. The useful output is the probability that the answer is yes.",
      "Noul 问题问一件可回答是或否的事。有用的输出是答案为“是”的概率。"
    ),
    blocks: [
      h2("Request", "请求"),
      p(
        "You supply instructions. There is no criteria map. Phrase the question so that “yes” is the condition you might act on.",
        "你提供 instructions，没有 criteria 映射。把问题写成：“是”就是你可能采取行动的条件。"
      ),
      code(`{
  "state": {
    "draft": "I can share the customer's password reset link.",
    "policy": "do not disclose credentials or account secrets"
  },
  "questions": {
    "violates_policy": {
      "type": "noul",
      "instructions": "Does \`draft\` violate \`policy\`?"
    }
  }
}`),
      h2("Thresholds belong to you", "门槛属于你"),
      p(
        "A probability is not a decision to send, block, or refund. Pick a cutoff from your own traffic. Below the cutoff, send the case to a person or a slower model.",
        "概率不是发送、拦截或退款的决定。用你自己的流量选定截止值。低于截止值时，把个案交给人或更慢的模型。"
      ),
      note(
        "Noul is a yes-probability, not a chat completion. Do not ask it to draft the reply.",
        "Noul 是“是”的概率，不是聊天补全。不要让它起草回复。"
      ),
    ],
  },
  {
    slug: "primitives/structure",
    title: bi("Structure", "结构"),
    lede: bi(
      "Instructions, choice criteria, and score levels are plain JSON. The shape is the contract.",
      "说明、choice 标准和 score 等级都是普通 JSON。形状就是契约。"
    ),
    blocks: [
      h2("State", "State"),
      ul([
        bi("A string is allowed when the whole situation is one blob of text.", "整段情境只是一块文本时，可以用字符串。"),
        bi("An object is better when questions cite fields with backticks.", "问题要用反引号引用字段时，对象更好。"),
        bi("Arrays of text are fine inside a field. Do not send images, audio, or video.", "字段里可以放文本数组。不要发送图片、音频或视频。"),
      ]),
      info(
        "Laya currently evaluates text: strings, JSON objects, and arrays of text. Images, audio, and video are not accepted.",
        "Laya 目前评估文本：字符串、JSON 对象和文本数组。不接受图片、音频和视频。"
      ),
      h2("Question object", "问题对象"),
      table(
        [bi("Field", "字段"), bi("choice", "choice"), bi("score", "score"), bi("noul", "noul")],
        [
          [bi("type", "type"), bi("required", "必填"), bi("required", "必填"), bi("required", "必填")],
          [bi("instructions", "instructions"), bi("required", "必填"), bi("required", "必填"), bi("required", "必填")],
          [bi("criteria", "criteria"), bi("object of options", "选项对象"), bi("array of levels", "等级数组"), bi("omit", "省略")],
        ]
      ),
      h2("One call, many names", "一次调用，多个名字"),
      p(
        "Put independent judgments in the same questions object so they share one state and one audit row. Do not chain a second predict until the first result should change the state.",
        "把彼此独立的判断放进同一个 questions 对象，这样它们共享一份 state 和一条审计。只有当第一次结果应该改写 state 时，才再发第二次 predict。"
      ),
    ],
  },
  {
    slug: "concepts/decisions",
    title: bi("Typed decisions", "类型化决策"),
    lede: bi(
      "Laya is a decision model. It returns judgments for software, not paragraphs for people.",
      "Laya 是决策模型。它给软件返回判断，而不是给人写段落。"
    ),
    blocks: [
      p(
        "Keep product rules, arithmetic, and side effects in code. Ask Laya for a narrow judgment: a queue, a yes-probability, a level on a scale you defined. Compose those results yourself.",
        "把产品规则、算术和副作用留在代码里。向 Laya 要一个窄判断：一个队列、一个“是”的概率、你定义的量尺上的一级。结果由你自己组合。"
      ),
      h2("What it is not", "它不是什么"),
      ul([
        bi("Not a chat assistant. Do not ask for an email draft as the answer.", "不是聊天助手。不要把起草邮件当作答案。"),
        bi("Not a tokenizer you bill. The console usage page counts audit rows, not tokens.", "不是按 token 计费的生成器。控制台用量页统计审计行，而不是 token。"),
        bi("Not a place to hide policy. Thresholds and refunds stay in your system.", "不是藏策略的地方。门槛和退款仍在你的系统里。"),
      ]),
      h2("How a call moves", "一次调用如何流动"),
      p(
        "You POST JSON. The console authenticates the laya_ key, stores an audit row, and proxies the body to the hosted Laya runtime. The runtime answers the questions. Your process reads the JSON and acts.",
        "你 POST JSON。控制台认证 laya_ 密钥，保存审计行，并把请求体代理到托管的 Laya 运行时。运行时回答问题。你的进程读取 JSON 并采取行动。"
      ),
    ],
  },
  {
    slug: "concepts/state",
    title: bi("State", "State"),
    lede: bi(
      "State is the context for every question in the call. Name the fields your instructions will cite.",
      "State 是这次调用里每个问题的上下文。给你的说明会引用的字段起名。"
    ),
    blocks: [
      h2("Shape", "形状"),
      p(
        "Use an object for anything with more than one fact. A support ticket might carry message, channel, and priority_hint. An inbox item might carry subject, body, and from.",
        "多于一个事实时使用对象。客服工单可以带 message、channel 和 priority_hint。收件箱条目可以带 subject、body 和 from。"
      ),
      code(`{
  "state": {
    "message": "Customer says their order never arrived and wants a refund immediately.",
    "channel": "support",
    "priority_hint": "unknown"
  },
  "preset": "triage"
}`),
      h2("What to leave out", "不要放什么"),
      ul([
        bi("Secrets, raw passwords, and payment card numbers.", "密钥、明文密码和银行卡号。"),
        bi("Whole conversation logs when one field would do.", "一个字段就够时，不要塞整段对话日志。"),
        bi("Instructions that belong on the question, not in the state.", "属于问题的说明不要写进 state。"),
      ]),
      note(
        "The same state can be reused with another preset. See [preset cascade](/docs/patterns/cascade).",
        "同一份 state 可以换一个预设再用。见[预设级联](/docs/patterns/cascade)。"
      ),
    ],
  },
  {
    slug: "concepts/build",
    title: bi("How to build", "如何构建"),
    lede: bi(
      "Design the workflow so code stays in control and Laya only answers narrow questions.",
      "把流程设计成代码掌舵，Laya 只回答窄问题。"
    ),
    blocks: [
      h2("A small loop", "一个小循环"),
      ul([
        bi("Collect state from your system of record.", "从你的记录系统收集 state。"),
        bi("Ask one preset or a handful of named questions.", "问一个预设，或少量具名问题。"),
        bi("Apply thresholds you chose.", "套用你选定的门槛。"),
        bi("Perform the side effect, or escalate.", "执行副作用，或升级。"),
      ]),
      h2("Batch independent questions", "把独立问题放在一批"),
      p(
        "If urgency and queue do not depend on each other, send both in one questions object. You pay one round trip and one audit row. Split the call when the second question needs the first answer inside state.",
        "如果紧急程度和队列互不依赖，把两者放进同一个 questions 对象。一次往返、一条审计。只有当第二个问题需要把第一个答案写进 state 时才拆开。"
      ),
      h2("Escalate on purpose", "有意升级"),
      p(
        "High-stakes actions — refunds, account access, public replies — should require a threshold you can explain. The [confidence gate cookbook](/docs/cookbooks/confidence-gate) shows the shape.",
        "高风险动作——退款、账户访问、公开回复——应要求一个你能解释的门槛。[置信门槛做法](/docs/cookbooks/confidence-gate) 给出了形状。"
      ),
    ],
  },
  {
    slug: "cookbooks",
    title: bi("Cookbooks", "做法"),
    lede: bi(
      "Working recipes on the real predict body: presets and choice, score, and noul. Each one is runnable JSON.",
      "基于真实 predict 请求体的做法：预设以及 choice、score、noul。每一份都是可运行的 JSON。"
    ),
    blocks: [
      table(
        [bi("Recipe", "做法"), bi("Use when", "适用")],
        [
          [bi("[Support triage](/docs/cookbooks/triage)", "[客服分诊](/docs/cookbooks/triage)"), bi("A ticket needs the built-in triage preset.", "工单适合内置 triage 预设。")],
          [bi("[Inbox routing](/docs/cookbooks/inbox)", "[收件箱路由](/docs/cookbooks/inbox)"), bi("Subject and body should pick a mailbox.", "主题和正文要决定邮箱。")],
          [bi("[Guard a reply](/docs/cookbooks/guard)", "[回复防护](/docs/cookbooks/guard)"), bi("A draft must be checked against a policy.", "草稿必须对照策略检查。")],
          [bi("[Parallel questions](/docs/cookbooks/parallel)", "[并行问题](/docs/cookbooks/parallel)"), bi("Intent and urgency should return together.", "意图和紧急程度要一起返回。")],
          [bi("[Confidence gate](/docs/cookbooks/confidence-gate)", "[置信门槛](/docs/cookbooks/confidence-gate)"), bi("Low-certainty cases should reach a person.", "低确定性个案应交给人。")],
        ]
      ),
      p(
        "Replace $ORIGIN with this console and $LAYA_CONSOLE_KEY with a key from API Keys. The hosted runtime at https://laya.wearglass.work/predict accepts the same JSON with its own key.",
        "把 $ORIGIN 换成本控制台，把 $LAYA_CONSOLE_KEY 换成 API 密钥页的密钥。托管运行时 https://laya.wearglass.work/predict 用它自己的密钥接受同一份 JSON。"
      ),
    ],
  },
  {
    slug: "cookbooks/triage",
    title: bi("Support triage", "客服分诊"),
    lede: bi(
      "Classify an inbound support message with the triage preset.",
      "用 triage 预设给入站客服消息分类。"
    ),
    blocks: [
      h2("State", "State"),
      p(
        "Include the customer text and any channel your queue logic already knows. The preset supplies the questions.",
        "放上客户原文，以及队列逻辑已经知道的渠道。问题由预设提供。"
      ),
      code(`curl -sS "$ORIGIN/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: $LAYA_CONSOLE_KEY" \\
  -d '{
    "state": {
      "message": "Customer says their order never arrived and wants a refund immediately.",
      "channel": "support",
      "priority_hint": "unknown"
    },
    "preset": "triage"
  }'`),
      h2("What you do with it", "拿到结果之后"),
      p(
        "Map the triage result onto queues you already operate. If the result is uncertain, leave the ticket in a human inbox instead of auto-refunding.",
        "把 triage 结果映射到你已经在用的队列。如果结果不确定，把工单留在人工收件箱，不要自动退款。"
      ),
    ],
  },
  {
    slug: "cookbooks/inbox",
    title: bi("Inbox routing", "收件箱路由"),
    lede: bi(
      "Route an email with the email preset, or with an explicit choice question when your mailboxes are custom.",
      "用 email 预设路由邮件；邮箱是自定义的时候，改用明确的 choice 问题。"
    ),
    blocks: [
      h2("Preset", "预设"),
      code(`{
  "state": {
    "subject": "Refund for order #1842",
    "body": "I was charged twice and need this reversed today.",
    "from": "sam@example.com"
  },
  "preset": "email"
}`),
      h2("Custom mailboxes", "自定义邮箱"),
      p(
        "When the preset’s buckets are not your folders, send a choice question whose criteria keys are your folder ids.",
        "当预设的分桶不是你的文件夹时，发送 choice 问题，criteria 的键就是你的文件夹 id。"
      ),
      code(`{
  "state": {
    "subject": "Refund for order #1842",
    "body": "I was charged twice and need this reversed today."
  },
  "questions": {
    "folder": {
      "type": "choice",
      "instructions": "Which folder should receive this email?",
      "criteria": {
        "billing": "payments and refunds",
        "support": "product help",
        "spam": "unsolicited or abusive"
      }
    }
  }
}`),
    ],
  },
  {
    slug: "cookbooks/guard",
    title: bi("Guard a reply", "回复防护"),
    lede: bi(
      "Check a draft against a written policy before anything is sent.",
      "在发送任何内容之前，对照书面策略检查草稿。"
    ),
    blocks: [
      p(
        "The guard preset scores policy risk for a draft. A noul question is the right custom form when you have one policy sentence and want a yes-probability.",
        "guard 预设给草稿的策略风险打分。当你有一句策略、想要“是”的概率时，noul 是合适的自定义形式。"
      ),
      code(`{
  "state": {
    "draft": "I can share the customer's password reset link with you.",
    "policy": "do not disclose credentials or account secrets"
  },
  "preset": "guard"
}`),
      h2("Custom yes/no", "自定义是非"),
      code(`{
  "state": {
    "draft": "I can share the customer's password reset link with you.",
    "policy": "do not disclose credentials or account secrets"
  },
  "questions": {
    "violates_policy": {
      "type": "noul",
      "instructions": "Does \`draft\` violate \`policy\`?"
    }
  }
}`),
      note(
        "Blocking or sending is your code. Do not treat a single probability as an automatic send.",
        "拦截或发送是你的代码。不要把单个概率当成自动发送。"
      ),
    ],
  },
  {
    slug: "cookbooks/parallel",
    title: bi("Parallel questions", "并行问题"),
    lede: bi(
      "Ask intent, urgency, and a yes/no in one predict so a support state returns together.",
      "在一次 predict 里同时问意图、紧急程度和一道是非题，让客服 state 一次返回。"
    ),
    blocks: [
      code(`{
  "state": { "message": "订单三天没发货，想退款" },
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "What does the customer want in \`message\`?",
      "criteria": {
        "refund": "money back",
        "technical_help": "bug or outage",
        "other": "none of the above"
      }
    },
    "is_urgent": {
      "type": "noul",
      "instructions": "Does \`message\` communicate time pressure?"
    },
    "urgency": {
      "type": "score",
      "instructions": "How urgent is the request?",
      "criteria": ["no time pressure", "needs attention soon", "blocking"]
    }
  }
}`),
      p(
        "Read each key independently. intent.refund can be true as a label while urgency is still low. Your router combines them.",
        "每个键独立读取。intent 可以是 refund，同时 urgency 仍然低。路由由你组合。"
      ),
    ],
  },
  {
    slug: "cookbooks/confidence-gate",
    title: bi("Confidence gate", "置信门槛"),
    lede: bi(
      "Automate only when the result clears a cutoff you store in code. Everything else waits for a person.",
      "只有结果超过你写在代码里的截止值时才自动处理。其余等待人工。"
    ),
    blocks: [
      h2("Pattern", "模式"),
      code(`const res = await fetch(origin + "/v1/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": consoleKey,
  },
  body: JSON.stringify({
    state: { message },
    preset: "triage",
  }),
});
const data = await res.json();
if (!res.ok) throw new Error(data.error || "predict_failed");

// Cutoffs are product policy. Read the probability fields
// the runtime returned for this preset and compare them here.
const confident = meetsCutoff(data);
if (confident) routeAutomatically(data);
else handToHuman(data);`),
      p(
        "meetsCutoff is yours. The console does not ship a universal confidence field name, and it does not apply your cutoff. Inspect a live response for the preset you use, then pin the check in code.",
        "meetsCutoff 属于你。控制台没有统一的置信度字段名，也不会替你应用截止值。先看你所用预设的真实响应，再把检查钉在代码里。"
      ),
      info(
        "Log the audit id side of the decision in your own system if you need a case review. The console audit log stores status, latency, and the response for that call.",
        "如果需要复盘个案，在你自己的系统里记下这次决策。控制台审计日志保存该次调用的状态、延迟和响应。"
      ),
    ],
  },
  {
    slug: "patterns",
    title: bi("Patterns", "模式"),
    lede: bi(
      "Compositions on top of one predict call. They stay small so the audit trail stays readable.",
      "一次 predict 之上的组合。保持短小，审计才读得懂。"
    ),
    blocks: [
      ul([
        bi("[Fan-out](/docs/patterns/fan-out) — many questions, one state.", "[扇出](/docs/patterns/fan-out) — 多个问题，一份 state。"),
        bi("[Confidence routing](/docs/patterns/confidence) — act or escalate.", "[置信路由](/docs/patterns/confidence) — 执行或升级。"),
        bi("[Preset cascade](/docs/patterns/cascade) — router, then a second preset.", "[预设级联](/docs/patterns/cascade) — 先 router，再第二个预设。"),
        bi("[Intent routing](/docs/patterns/intent) — choice keys become handlers.", "[意图路由](/docs/patterns/intent) — choice 的键变成处理程序。"),
      ]),
    ],
  },
  {
    slug: "patterns/fan-out",
    title: bi("Fan-out", "扇出"),
    lede: bi(
      "Send every independent question in a single body. Ignore results you do not need yet.",
      "把所有独立问题放进同一个请求体。暂时用不到的结果可以忽略。"
    ),
    blocks: [
      p(
        "Speculative questions are cheap to ignore and expensive to round-trip later. If a support screen might show both queue and policy, ask both. Your UI decides what to render.",
        "投机性问题忽略起来便宜，事后再补请求则贵。如果客服界面可能同时显示队列和策略，就两个都问。界面决定渲染什么。"
      ),
      p(
        "The [parallel questions cookbook](/docs/cookbooks/parallel) is the concrete body. Fan-out is that idea applied whenever the questions do not depend on each other.",
        "[并行问题做法](/docs/cookbooks/parallel) 是具体请求体。扇出就是：只要问题互不依赖，就用这个办法。"
      ),
    ],
  },
  {
    slug: "patterns/confidence",
    title: bi("Confidence routing", "置信路由"),
    lede: bi(
      "The answer says what; your cutoff says whether to act.",
      "答案说明是什么；你的截止值决定是否行动。"
    ),
    blocks: [
      p(
        "Read the probability the runtime returned for the question you asked. Compare it to a number checked into your service. Above it, run the handler. Below it, open a review task.",
        "读取运行时为你所问问题返回的概率。把它和写进你服务里的数字比较。高于它就运行处理程序。低于它就开一条复核任务。"
      ),
      ul([
        bi("Do not share one cutoff across refunds and spam.", "退款和垃圾邮件不要共用一个截止值。"),
        bi("Revisit the number when you sample real tickets.", "抽查真实工单后回头调整这个数字。"),
        bi("Store the raw response if a reviewer needs to see why it escalated.", "如果复核人需要知道为何升级，保存原始响应。"),
      ]),
    ],
  },
  {
    slug: "patterns/cascade",
    title: bi("Preset cascade", "预设级联"),
    lede: bi(
      "Call router first. Call email, moderation, or guard only when that result says to go deeper.",
      "先调用 router。只有结果要求深入时，再调用 email、moderation 或 guard。"
    ),
    blocks: [
      p(
        "Use the same state object on the second call so the audit rows line up. Keep each body to one preset or one small questions object.",
        "第二次调用使用同一个 state 对象，审计行才对得上。每个请求体只放一个预设或一小份 questions。"
      ),
      code(`# 1. router
{"state": {"text": "Look up order 1842 and draft a refund reply.", "tools": ["orders.lookup", "billing.refund", "email.draft"]}, "preset": "router"}

# 2. only if router points at email
{"state": {"subject": "Refund for order #1842", "body": "...", "from": "sam@example.com"}, "preset": "email"}`),
      note(
        "Two calls mean two audit rows. That is intentional. Do not hide the second decision inside the first prompt.",
        "两次调用就是两条审计。这是有意的。不要把第二个决策藏进第一个提示词。"
      ),
    ],
  },
  {
    slug: "patterns/intent",
    title: bi("Intent routing", "意图路由"),
    lede: bi(
      "A choice question’s option ids are the handlers in your code: a function, a queue, or a person.",
      "Choice 问题的选项 id 就是你代码里的处理程序：一个函数、一个队列或一个人。"
    ),
    blocks: [
      p(
        "Define criteria keys that already exist as routes. billing calls your refund workflow. other files a review. There is no tool-calling protocol on this API — you dispatch after the JSON returns.",
        "把 criteria 的键定义成已经存在的路由。billing 调用你的退款流程。other 进入复核。这个 API 没有工具调用协议——JSON 返回后由你分发。"
      ),
      code(`{
  "state": { "text": "Look up order 1842 and draft a refund reply." },
  "questions": {
    "handler": {
      "type": "choice",
      "instructions": "Which handler should run for \`text\`?",
      "criteria": {
        "orders.lookup": "find an order",
        "billing.refund": "start a refund",
        "email.draft": "a human drafts the reply",
        "other": "none of these"
      }
    }
  }
}`),
    ],
  },
  {
    slug: "confidence",
    title: bi("Confidence", "置信"),
    lede: bi(
      "Laya returns probabilities with typed answers. Confidence is how you decide whether to act, and it lives in your policy.",
      "Laya 随类型化答案返回概率。置信决定你是否行动，它属于你的策略。"
    ),
    blocks: [
      p(
        "A choice distribution and a noul yes-probability answer different questions. Do not collapse them into one score unless your product defines that formula.",
        "Choice 的分布和 noul 的“是”概率回答的是不同问题。除非产品定义了公式，否则不要合成一个分数。"
      ),
      h2("Use it", "怎么用"),
      ul([
        bi("Pick a cutoff per action, not per model marketing name.", "按动作选定截止值，而不是按模型宣传名。"),
        bi("Sample errors. Raise the cutoff when false automations are costly.", "抽查错误。自动处理的误伤很贵时，提高截止值。"),
        bi("Show reviewers the state and the raw JSON, not a single badge.", "给复核人看 state 和原始 JSON，而不是一枚徽章。"),
      ]),
      info(
        "The console does not document a frozen response schema for probability keys. Read a live predict response for your preset or questions, then code against those keys.",
        "控制台没有冻结概率字段的响应模式。先读你的预设或问题的真实 predict 响应，再按那些键写代码。"
      ),
    ],
  },
  {
    slug: "models",
    title: bi("Runtime", "运行时"),
    lede: bi(
      "Playground and API keys use one hosted Laya decision runtime. The console label in the playground is laya-latest.",
      "试验场和 API 密钥使用同一个托管的 Laya 决策运行时。试验场里的控制台标签是 laya-latest。"
    ),
    blocks: [
      h2("laya-latest", "laya-latest"),
      p(
        "laya-latest names the current decision runtime behind this console. It answers presets and custom choice, score, and noul questions. It is not a chat model.",
        "laya-latest 是本控制台背后当前决策运行时的名字。它回答预设以及自定义的 choice、score 和 noul。它不是聊天模型。"
      ),
      h2("Where the call goes", "调用去哪里"),
      p(
        "The console writes an audit row, then POSTs the body to the hosted runtime configured as LAYA_UPSTREAM_URL. Callers send their own laya_ key. They never send the upstream key.",
        "控制台先写审计，再把请求体 POST 到配置为 LAYA_UPSTREAM_URL 的托管运行时。调用方发送自己的 laya_ 密钥，从不发送上游密钥。"
      ),
      code(`{ "runtime": "laya-latest", "presets": ["triage", "email", "guard", "moderation", "router"] }`),
      note(
        "There is no model catalog endpoint on this console. GET /health on the console returns liveness only. The hosted runtime’s GET /health is a separate URL and lists presets.",
        "本控制台没有模型目录接口。控制台的 GET /health 只返回存活信息。托管运行时的 GET /health 是另一个 URL，并会列出预设。"
      ),
    ],
  },
  {
    slug: "api",
    title: bi("Predict API", "Predict API"),
    lede: bi(
      "HTTP surface on this console. There is no generated client SDK in this repository.",
      "本控制台的 HTTP 接口。本仓库没有生成的客户端 SDK。"
    ),
    blocks: [
      h2("Console paths", "控制台路径"),
      table(
        [bi("Method", "方法"), bi("Path", "路径"), bi("Auth", "认证"), bi("Purpose", "用途")],
        [
          [bi("POST", "POST"), bi("/v1/predict", "/v1/predict"), bi("API key", "API 密钥"), bi("Run a decision", "运行一次决策")],
          [bi("POST", "POST"), bi("/predict", "/predict"), bi("API key", "API 密钥"), bi("Same handler as /v1/predict", "与 /v1/predict 同一处理程序")],
          [bi("GET", "GET"), bi("/health", "/health"), bi("none", "无"), bi("Console liveness", "控制台存活")],
        ]
      ),
      h2("Body", "请求体"),
      p(
        "state is required and may be any JSON value. preset selects a built-in question set and defaults to triage when questions is omitted. questions, when present, is an object of named choice, score, or noul questions and is forwarded as-is.",
        "state 必填，可以是任意 JSON。省略 questions 时，preset 选择内置问题集，默认 triage。若提供 questions，它是具名的 choice、score 或 noul 对象，并会被原样转发。"
      ),
      code(`{
  "state": { "message": "order never arrived", "channel": "support" },
  "preset": "triage"
}`),
      h2("Hosted runtime", "托管运行时"),
      p(
        "The same body is accepted by POST https://laya.wearglass.work/predict with that deployment’s API key. GET https://laya.wearglass.work/health lists presets and does not require a key. Prefer the console path when you want audit and usage on this deployment.",
        "POST https://laya.wearglass.work/predict 用该部署的 API 密钥接受同一请求体。GET https://laya.wearglass.work/health 列出预设且不需要密钥。希望审计和用量留在本部署时，优先走控制台路径。"
      ),
      h2("Optional local package", "可选的本地包"),
      p(
        "A local Python package named laya can run offline experiments. It is not the console API and it is not required for predict.",
        "名为 laya 的本地 Python 包可以做离线实验。它不是控制台 API，predict 也不依赖它。"
      ),
      code(`pip install 'laya>=0.3.3'`),
      note(
        "Do not invent client classes, retries, or webhooks. If it is not on this page, this console does not provide it.",
        "不要臆造客户端类、重试策略或 webhook。这一页没写的，本控制台就不提供。"
      ),
    ],
  },
  {
    slug: "api/auth",
    title: bi("Authentication", "认证"),
    lede: bi(
      "People sign in with email and password. Programs send a console API key.",
      "人用邮箱和密码登录。程序发送控制台 API 密钥。"
    ),
    blocks: [
      h2("Session", "会话"),
      p(
        "Register and sign-in set an httpOnly cookie. Passwords are stored as scrypt hashes. New accounts are members. The playground uses this session and does not require an API key.",
        "注册和登录会设置 httpOnly Cookie。密码以 scrypt 哈希保存。新账号是成员。试验场使用该会话，不需要 API 密钥。"
      ),
      h2("API key", "API 密钥"),
      p(
        "Send the secret in X-API-Key or Authorization: Bearer. The server hashes it with SHA-256 and matches a stored hash. A missing or revoked key is rejected before the runtime is called. The raw secret is not written to the audit log.",
        "在 X-API-Key 或 Authorization: Bearer 里发送密钥。服务器用 SHA-256 哈希后与库存哈希比对。缺失或已吊销的密钥会在调用运行时之前被拒绝。审计日志不写密钥原文。"
      ),
      code(`curl -sS "$ORIGIN/v1/predict" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: laya_your_key" \\
  -d '{"state":{"message":"hello"},"preset":"triage"}'`),
    ],
  },
  {
    slug: "api/errors",
    title: bi("Errors", "错误"),
    lede: bi(
      "Predict errors you can handle without guessing.",
      "可以明确处理的 predict 错误。"
    ),
    blocks: [
      table(
        [bi("Status", "状态"), bi("error", "error"), bi("Meaning", "含义")],
        [
          [bi("400", "400"), bi("invalid_json", "invalid_json"), bi("Body was not JSON.", "请求体不是 JSON。")],
          [bi("400", "400"), bi("missing_state", "missing_state"), bi("state was omitted.", "缺少 state。")],
          [bi("400", "400"), bi("unknown_preset", "unknown_preset"), bi("preset is not built-in and questions was omitted.", "预设不是内置值，且省略了 questions。")],
          [bi("401", "401"), bi("missing_api_key", "missing_api_key"), bi("No X-API-Key or Bearer secret.", "没有 X-API-Key 或 Bearer 密钥。")],
          [bi("401", "401"), bi("invalid_api_key", "invalid_api_key"), bi("Unknown or revoked key.", "密钥未知或已吊销。")],
          [bi("502", "502"), bi("upstream_unreachable", "upstream_unreachable"), bi("Hosted runtime could not be reached.", "无法连接托管运行时。")],
          [bi("503", "503"), bi("audit_failed", "audit_failed"), bi("The audit row could not be stored, so upstream was not called.", "审计行没能写入，因此没有调用上游。")],
        ]
      ),
      code(`{ "ok": false, "error": "missing_state" }`),
      p(
        "2xx responses are the runtime’s JSON, passed through after the audit write. Auth failures are logged without the request body and without the raw secret.",
        "2xx 是运行时的 JSON，在审计写入之后原样返回。认证失败会记日志，但不含请求体，也不含密钥原文。"
      ),
    ],
  },
  {
    slug: "api/keys",
    title: bi("API keys", "API 密钥"),
    lede: bi(
      "Keys belong to the signed-in user. Members and admins each manage their own keys.",
      "密钥属于当前登录用户。成员和管理员各自管理自己的密钥。"
    ),
    blocks: [
      h2("Create and reveal once", "创建并只显示一次"),
      p(
        "Choose a name. The response includes the full laya_ secret a single time. After you dismiss it, the console can only show the prefix.",
        "起一个名字。响应里会包含完整的 laya_ 密钥，而且只此一次。关闭之后，控制台只能显示前缀。"
      ),
      h2("Storage", "存储"),
      p(
        "The database stores key id, name, prefix, SHA-256 hash, owner, and revoked flag. It does not store the secret. Audit rows store key id, prefix, and name only.",
        "数据库保存密钥 id、名称、前缀、SHA-256 哈希、所有者和吊销标记。不保存密钥原文。审计行只保存密钥 id、前缀和名称。"
      ),
      h2("Revoke", "吊销"),
      p(
        "Revoking a key marks it inactive. Later predict calls with that secret fail authentication and do not reach the runtime.",
        "吊销会把密钥标为停用。之后使用该密钥的 predict 会认证失败，不会到达运行时。"
      ),
      note(
        "A member cannot list or revoke another account’s keys. Keys are not a billing instrument.",
        "成员不能列出或吊销其他账号的密钥。密钥不是计费工具。"
      ),
    ],
  },
  {
    slug: "api/presets",
    title: bi("Presets", "预设"),
    lede: bi(
      "Five built-in question sets. Pass one in preset, or send your own questions object.",
      "五套内置问题。在 preset 里传入其中一个，或发送你自己的 questions 对象。"
    ),
    blocks: [
      table(
        [bi("preset", "preset"), bi("Use when", "适用")],
        [
          [bi("triage", "triage"), bi("Support intent, urgency, refund, churn.", "客服意图、紧急程度、退款、流失。")],
          [bi("email", "email"), bi("Inbox routing, spam, phishing, reply need.", "收件箱路由、垃圾邮件、钓鱼、是否需要回复。")],
          [bi("guard", "guard"), bi("Policy risk on a draft or prompt.", "草稿或提示词的策略风险。")],
          [bi("moderation", "moderation"), bi("Toxicity, harassment, or spam on a post.", "帖子上的毒性、骚扰或垃圾内容。")],
          [bi("router", "router"), bi("Which tool or domain should handle a request.", "请求应由哪个工具或领域处理。")],
        ]
      ),
      h3("triage", "triage"),
      code(`{
  "state": {
    "message": "Customer says their order never arrived and wants a refund immediately.",
    "channel": "support"
  },
  "preset": "triage"
}`),
      h3("email", "email"),
      code(`{
  "state": {
    "subject": "Refund for order #1842",
    "body": "I was charged twice and need this reversed today.",
    "from": "sam@example.com"
  },
  "preset": "email"
}`),
      h3("guard", "guard"),
      code(`{
  "state": {
    "draft": "I can share the customer's password reset link with you.",
    "policy": "do not disclose credentials or account secrets"
  },
  "preset": "guard"
}`),
      h3("moderation", "moderation"),
      code(`{
  "state": {
    "text": "This update is disappointing and the team should be ashamed.",
    "surface": "comment"
  },
  "preset": "moderation"
}`),
      h3("router", "router"),
      code(`{
  "state": {
    "text": "Look up order 1842 and draft a refund reply.",
    "tools": ["orders.lookup", "billing.refund", "email.draft"]
  },
  "preset": "router"
}`),
    ],
  },
  {
    slug: "skill",
    title: bi("Agent skill", "代理技能"),
    lede: bi(
      "Optional install so coding agents draft Laya calls. The console API works without it.",
      "可选安装，让编码代理起草 Laya 调用。不用它也能使用控制台 API。"
    ),
    blocks: [
      h2("Install", "安装"),
      code(`npx skills add wearshoes/laya-skills --skill laya-ai`),
      p(
        "Claude Code alternative, and only one of these: claude plugin marketplace add wearshoes/laya-skills, then claude plugin install laya-ai@wearshoes/laya-skills.",
        "Claude Code 的替代方式，二选一：claude plugin marketplace add wearshoes/laya-skills，然后 claude plugin install laya-ai@wearshoes/laya-skills。"
      ),
      h2("Read it", "阅读"),
      code(`https://github.com/wearshoes/laya-skills
https://github.com/wearshoes/wearglass-skills/blob/main/skills/laya-ai/SKILL.md`),
      h2("Pair it with a key", "与密钥配对"),
      p(
        "Set LAYA_API_KEY when the agent should call the hosted runtime directly. Set a console laya_ key when the agent should call this console so usage and audit stay here.",
        "代理应直接调用托管运行时时设置 LAYA_API_KEY。代理应调用本控制台、让用量和审计留在这里时，使用控制台 laya_ 密钥。"
      ),
      note(
        "The skill does not replace API keys, the playground, or your thresholds.",
        "技能不能替代 API 密钥、试验场或你的门槛。"
      ),
    ],
  },
  {
    slug: "legal",
    title: bi("Legal", "法律"),
    lede: bi(
      "Short product notes. The same texts are linked from sign-in.",
      "简短的产品说明。登录页也链到同样的文本。"
    ),
    blocks: [
      h2("Terms", "条款"),
      p(
        "Use the console only with data you are allowed to send. Treat a revealed laya_ secret like a password. See [terms](/legal/terms).",
        "只提交你有权发送的数据。把显示过的 laya_ 密钥当作密码。见[条款](/legal/terms)。"
      ),
      h2("Privacy", "隐私"),
      p(
        "The database stores email, name, organization, role, a scrypt password hash, key hashes, and audit JSON. It does not store raw API secrets or the upstream key. See [privacy](/legal/privacy).",
        "数据库保存邮箱、姓名、组织、角色、scrypt 密码哈希、密钥哈希和审计 JSON。不保存 API 密钥原文或上游密钥。见[隐私](/legal/privacy)。"
      ),
      h2("Trust", "信任"),
      p(
        "Sessions are httpOnly. Members see their own keys and usage. See [trust](/legal/trust).",
        "会话是 httpOnly。成员只能看到自己的密钥和用量。见[信任](/legal/trust)。"
      ),
    ],
  },
  {
    slug: "console",
    title: bi("Console notes", "控制台说明"),
    lede: bi(
      "Billing, organizations, and shares as they actually behave in this console.",
      "账单、组织和分享在本控制台中的实际行为。"
    ),
    blocks: [
      h2("Billing", "账单"),
      p(
        "The billing screen is a preview. Amount due stays zero. Add credits does not collect a card and does not call a payment processor.",
        "账单页是预览。应付金额保持为零。增加额度不会收集卡号，也不会调用支付机构。"
      ),
      h2("Organizations", "组织"),
      p(
        "An organization is the name stored on each user. You see people who share that name. An invite stores an email and a token. The invited person joins when they register with the same email. Invites do not send mail by themselves.",
        "组织就是保存在每个用户上的名称。你能看到名称相同的人。邀请会保存邮箱和令牌。对方用同一邮箱注册后加入。邀请本身不会发信。"
      ),
      h2("Shares", "分享"),
      p(
        "A playground share stores a title, preset, and state JSON. The public link shows that JSON only. It never includes an API key. Revoking a share hides the public page.",
        "试验场分享保存标题、预设和 state JSON。公开链接只显示该 JSON，绝不包含 API 密钥。撤销后公开页不可见。"
      ),
    ],
  },
];

const ALIASES: Record<string, string> = {
  presets: "api/presets",
  authn: "api/auth",
  errors: "api/errors",
  keys: "api/keys",
  billing: "console",
  orgs: "console",
  shares: "console",
  overview: "",
};

const BY_SLUG = new Map(PAGES.map((page) => [page.slug, page]));

export function resolveSlug(slug: string) {
  const cleaned = slug.replace(/^\/+|\/+$/g, "");
  return ALIASES[cleaned] ?? cleaned;
}

export function getDoc(slug: string) {
  return BY_SLUG.get(resolveSlug(slug)) || null;
}

export function groupFor(slug: string) {
  const canonical = resolveSlug(slug);
  return NAV.find((group) => group.slugs.includes(canonical)) || null;
}

export function flatDocs() {
  const slugs = NAV.flatMap((group) => group.slugs);
  return slugs.map((slug) => BY_SLUG.get(slug)).filter((page): page is DocEntry => Boolean(page));
}

export function neighbors(slug: string) {
  const list = flatDocs();
  const canonical = resolveSlug(slug);
  const index = list.findIndex((page) => page.slug === canonical);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  };
}

export function pageHref(slug: string) {
  return slug ? `/docs/${slug}` : "/docs";
}

export function searchDocs(query: string, locale: Locale) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return flatDocs()
    .map((page) => {
      const blob = [tx(page.title, locale), tx(page.lede, locale), ...blocksText(page, locale)].join("\n");
      return { page, blob };
    })
    .filter((item) => item.blob.toLowerCase().includes(q))
    .slice(0, 12)
    .map((item) => item.page);
}

function blocksText(page: DocEntry, locale: Locale) {
  return page.blocks.flatMap((block) => {
    if (block.type === "p" || block.type === "h2" || block.type === "h3" || block.type === "callout") return [tx(block.text, locale)];
    if (block.type === "ul" || block.type === "flow") return block.type === "ul" ? block.items.map((item) => tx(item, locale)) : block.steps.map((item) => tx(item, locale));
    if (block.type === "code") return [block.code];
    if (block.type === "table") {
      return [...block.headers.map((header) => tx(header, locale)), ...block.rows.flat().map((cell) => tx(cell, locale))];
    }
    return [];
  });
}

export function pageMarkdown(page: DocEntry, locale: Locale) {
  const lines = [`# ${tx(page.title, locale)}`, "", tx(page.lede, locale), ""];
  for (const block of page.blocks) {
    if (block.type === "h2") lines.push(`## ${tx(block.text, locale)}`, "");
    else if (block.type === "h3") lines.push(`### ${tx(block.text, locale)}`, "");
    else if (block.type === "p" || block.type === "callout") lines.push(tx(block.text, locale), "");
    else if (block.type === "ul") lines.push(...block.items.map((item) => `- ${tx(item, locale)}`), "");
    else if (block.type === "code") lines.push("```", block.code, "```", "");
    else if (block.type === "flow") lines.push(block.steps.map((step) => tx(step, locale)).join(" → "), "");
    else if (block.type === "table") {
      lines.push(`| ${block.headers.map((header) => tx(header, locale)).join(" | ")} |`);
      lines.push(`| ${block.headers.map(() => "---").join(" | ")} |`);
      for (const row of block.rows) lines.push(`| ${row.map((cell) => tx(cell, locale)).join(" | ")} |`);
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function anchor(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-").replace(/^-|-$/g, "") || "section";
}
