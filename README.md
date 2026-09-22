# Laya Console

Wearglass control panel for the **Laya** decision API. Brand: **Laya Console**.

The UI follows the layout of a modern API console (split login, sidebar, playground, usage, keys) with original Laya / Wearglass branding. It does not include another product’s trademarks, logo, or bundles.

## Stack

- Next.js App Router, TypeScript, Tailwind
- SQLite via `better-sqlite3`
- Passwords hashed with Node **scrypt** (`scrypt$N$r$p$salt$hash`)
- API key secrets stored only as **SHA-256** plus a short prefix
- Upstream: `LAYA_UPSTREAM_URL` (default `https://laya.wearglass.work`)

## Roles

| Role | Access |
| --- | --- |
| `member` (default) | Own API keys, own usage, playground, in-app docs |
| `admin` | Everything a member has, plus **Audit** (all accounts and keys) and **Team** (change roles) |

`ADMIN_EMAILS` is a comma-separated list. Matching addresses are promoted to `admin` on register and on sign-in. Other users stay `member`. Removing an address from the list does not demote someone who was promoted in Team.

Audit is admin-only. Members do not see it in the sidebar. `/audit` and `/api/audit*` return **403**. `/admin` and `/api/admin*` do the same.

Authorization uses the role stored in SQLite, not the copy inside the session cookie.

## Audit gateway

Every path that calls the model writes an audit row **before** the upstream request:

- `POST /v1/predict` and `POST /predict` (console API key)
- `POST /api/playground/predict` (signed-in session)

If the audit insert fails, upstream is not called. The row stores account (user, email, org), key id / prefix / name, route, preset, IP, user agent, request JSON, then status, latency, and response JSON.

The raw API secret and `LAYA_UPSTREAM_API_KEY` are never written. Failed authentication is logged without a request body; only a `laya_` prefix (12 characters) is kept when the presented token looks like a console key.

Usage charts aggregate completed model calls from the same audit log. Members see their own rows. Admins can filter every account. Auth failures are excluded from usage.

## Pages

| Route | Who | What |
| --- | --- | --- |
| `/login`, `/register` | public | Email + password. httpOnly session cookie |
| `/home` | signed in | Hero and quickstart. Copy installs the Laya skill prompt |
| `/playground` | signed in | State JSON and presets `triage`, `email`, `guard`, `moderation`, `router` |
| `/usage` | signed in | Daily request charts |
| `/keys` | signed in | Create, reveal once (`laya_…`), list masked, revoke |
| `/docs` | public | Searchable docs: overview, quickstart, models, patterns, API, auth, errors, keys, presets, billing, orgs, shares, legal |
| `/settings` | signed in | Display name, language, and light/dark theme |
| `/billing` | signed in | Credit preview. Amount due is always `0`. No card capture |
| `/org` | signed in | Members who share an org name, plus invite links |
| `/shares` | signed in | Preset and state snapshots. Public page is `/s/[token]` |
| `/models` | signed in | `laya-latest` decision runtime |
| `/audit` | admin | Filterable request trail |
| `/admin` | admin | Change `member` / `admin`, and read saved feedback |
| `/legal/terms`, `/legal/privacy`, `/legal/trust` | public | Short policy notes |

Documentation in the sidebar opens `/docs`. The GitHub skill repo is mentioned only inside the quickstart as an optional install path.

## Languages

English and Simplified Chinese. The switcher is on the login / register panel and in the sidebar. The choice is stored in the `laya_lang` cookie (`en` or `zh-CN`). With no cookie, `Accept-Language` containing `zh` selects Chinese.

## Theme, commands, feedback

`laya_theme` is `light` or `dark` and sets `class="dark"` on the document. The same control is on Settings. `laya_sidebar` is `expanded` or `collapsed`. Press Cmd-K or Ctrl-K to open the command list (pages, theme, language, feedback, sign out). A skip link jumps to the main region.

Documentation at `/docs` can be read without a session. Search filters titles and page text. Playground share asks for a title before it creates a public link. Revoking an API key asks for confirmation. Usage charts filter by outcome, preset, range, and (for admins) account.

The feedback button stores a category and message in SQLite. It does not send the note anywhere else. Admins can read the list on Team. Members who call `GET /api/feedback` receive **403**.

## Billing, organizations, shares

Billing is a non-charging stub. `GET /api/billing` reports `charging: false`, `amountDue: 0`, and `usedCredits: 0`. `POST /api/billing/topup` returns **501** `payments_disabled`. There is no payment processor and no card form.

An organization is the `org` string on a user. Inviting someone creates a token and a register link (`/register?invite=…`). The invite is applied only when that email registers. The console does not send mail.

A share stores a title, optional preset, and state JSON. The public page shows that JSON only. API keys are not included. Revoking a share hides the public page.

## Setup

```bash
cp .env.local.example .env.local
# Set SESSION_SECRET and, if you proxy upstream, LAYA_UPSTREAM_API_KEY.
# Optional: ADMIN_EMAILS=you@example.com
npm install
npm run build
./start.sh
```

`./start.sh` listens on `127.0.0.1:8787` (override with `PORT` / `HOST` in `.env.local`).

```bash
npm run dev    # same host and port, with reload
```

### Password helper

```bash
node scripts/set-password.mjs you@example.com 'a-long-password'
```

Creates the user if needed, or replaces the password hash. Honors `ADMIN_EMAILS` and `DATABASE_PATH`.

### Create a key

```bash
node scripts/create-key.mjs http://127.0.0.1:8787 you@example.com 'a-long-password' "Production key"
```

### Call predict

```bash
curl -sS http://127.0.0.1:8787/v1/predict \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $SECRET" \
  -d '{"state":{"text":"order never arrived"},"preset":"triage"}'
```

`POST /predict` is the same handler. `GET /health` and `GET /api/health` do not require a key.

## Environment

| Variable | Purpose |
| --- | --- |
| `LAYA_UPSTREAM_URL` | Upstream base URL. Default `https://laya.wearglass.work` |
| `LAYA_UPSTREAM_API_KEY` | Server-only key sent upstream. Never commit it |
| `SESSION_SECRET` | HMAC secret for the session cookie |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `PORT` | Default `8787` |
| `DATABASE_PATH` | SQLite file. Default `./data/laya-console.db` |

Copy `.env.local.example` to `.env.local`. Do not commit `.env.local`, the database, or live secrets.

## Data

SQLite tables: `users` (including `role` and `password_hash`), `api_keys` (`key_hash`, `key_prefix`), `audit_events`, `org_invites`, `shares`, `feedback`.

Display names: an email whose local part contains `hao` or `wei` is shown as **hao wei** / **hao's org** unless a name was entered at registration.
