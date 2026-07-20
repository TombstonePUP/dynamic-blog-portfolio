# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@CONTEXT.md
@DESIGN.md

## Session protocol (graphify + Obsidian memory)

This repo has a persistent memory system: `graphify` maintains a structural map of the code (`graphify-out/graph.json`, auto-rebuilt on every commit via the installed git hooks — no LLM needed), and an Obsidian vault at `~/obsidian-vault/dynamic-blog-portfolio/` holds decision docs (hardlinked from CONTEXT.md/DESIGN.md), the structural map (junctioned from `graphify-out/`), and session logs.

- **Before exploring the codebase manually**: consult the graph first — `graphify query "<question>"`, `graphify explain "<symbol>"`, `graphify path "A" "B"`, or read `graphify-out/GRAPH_REPORT.md` directly. Fall back to grep/Glob only for what the graph doesn't cover (it indexes code structure, not runtime behavior or content). Check the graph isn't stale by comparing `git rev-parse HEAD` to the "Built from commit" line in `GRAPH_REPORT.md`; if stale, run `graphify update .` (no API key needed) rather than assuming the hook caught it.
- **At the end of a session**: write a short log to `~/obsidian-vault/dynamic-blog-portfolio/sessions/<YYYY-MM-DD>.md` — what was decided, what changed, what's left, and any blockers. One file per calendar day; append to the existing file if one already exists for today rather than overwriting it.
- **Doc-sync enforcement**: apply the *Living documentation* rules below — if a change touched something CONTEXT.md/DESIGN.md/README.md should reflect and didn't, flag it explicitly rather than letting it pass silently. Don't restate those rules elsewhere; this is the one place they live.

## Living documentation — read before and update after changes

This repo enforces doc/code sync as a hard rule (see CONTEXT.md header). Before making changes, read the doc that owns the area you're touching; after making changes, update it in the same PR:

- **README.md** — update for any feature addition, dev command change, env var change, or setup step change.
- **CONTEXT.md** — update for any change to project structure, routing, layout system, tech stack, or constraints. This is the architecture source of truth; do not duplicate design details here.
- **DESIGN.md** — update for any component addition/change/removal, or color token / typography / Tailwind class change. Do not duplicate architecture details here.

A code change touching any of the above is not considered complete until the matching doc is updated.

## Commands

```bash
npm run dev                          # start dev server
npm run build                        # production build
npm run lint                         # ESLint (eslint-config-next core-web-vitals + typescript)
npm run supabase:push                # push pending migrations to Supabase (supabase/migrations/*.sql)
npm run supabase:push:dry            # dry-run migration push
npm run supabase:seed-admin          # seed/repair the primary admin account
npm run supabase:reset-users         # reset users and comments (destructive — dev/staging only)
npm run supabase:import-posts        # migrate legacy local MDX posts (content/posts/) into Supabase
npm run supabase:import-posts:dry    # dry-run of the above
npm run supabase:test                # scripts/test-supabase.mjs — connectivity/env sanity check
node scripts/test-db-health.mjs      # DB health check (not wired to a package.json script)
```

There is no unit/e2e test framework configured (no Jest/Vitest/Playwright) — correctness is checked via `npm run lint`, `npm run build`, and the `scripts/test-*.mjs` Supabase checks.

## Architecture

Server-rendered Next.js App Router app (Supabase-backed CMS + public blog), layered so route files stay thin:

```
app/  → features/ (UI + feature-local server helpers) → services/ (business logic) → db/queries/ (Supabase persistence)
                                                        validators/ (Zod schemas, shared across the above)
```

- **`app/`** — route groups only, no business logic. `(admin)`, `(auth)`, `(guest)` are three separate **root layouts** (each has its own font, header, and shell — not nested under one global layout). `app/actions/` holds Server Actions, which must stay thin and delegate to `services/`.
- **`features/{auth,posts,users}/`** — feature-owned components, server helpers (`features/*/server/`), and feature-local lib code. This is where most UI and orchestration logic actually lives.
- **`services/`** — the business-logic entry points that routes/actions call into (`services/auth.ts`, `services/posts.ts`, `services/users.ts`).
- **`db/`** — `db/supabase/{client,server,admin,proxy}.ts` are the Supabase client factories; `db/queries/` holds the actual query/persistence modules (posts, profiles, comments, taxonomy, auth-security).
- **`lib/`, `types/`, `utils/supabase/`** — backward-compatibility shims for older import paths. Prefer `@/db/supabase/server` (Server Components) and `@/db/supabase/client` (Client Components) over `@/utils/supabase/*`, which is compat-only.
- **`validators/`** — centralized Zod schemas for auth, users, and post actions.
- **`config/`** — `client.config.ts` (single source of truth for branding/theme/feature-flag values, per MODULARIZATION_PLAN.md) and `env.config.ts` (env-var overrides on top of it).

### Middleware is called "proxy" here

Per AGENTS.md, this Next.js version has breaking changes from what you may expect. Concretely: there is no `middleware.ts` — the equivalent lives in **`proxy.ts`** at the repo root, exporting a `proxy()` function (not `middleware()`), which delegates to `db/supabase/proxy.ts`'s `updateSession`. Check `node_modules/next/dist/docs/` for other renamed conventions before assuming standard Next.js APIs apply.

### Auth model

`features/auth/server/context.ts` defines an escalating chain of context getters used throughout routes/actions:
`getAuthenticatedContext()` → `requireAuthenticatedContext()` (redirects to `/login`) → `requireApprovedContext()` (redirects to `/pending` if not approved) → `requireAdminContext()` (redirects to `/dashboard` if not admin/approved).
Server Actions that mutate admin-only data must call `requireAdminContext()` themselves — a role check in a Server Component/prop is not sufficient authorization.

### Guest-facing admin controls & "View as Guest"

Public guest routes can render admin moderation/edit controls inline when the request resolves to an approved admin. This is controlled by the `tsw_guest_view` server-only cookie (`features/posts/server/guest-view-mode.ts`) — toggled via a Server Action, never client state. When active, guest pages must only query published content and hide admin controls/badges, even for an admin session. Any new guest-facing feature must re-derive role/visibility server-side rather than trusting a client-passed prop.

### Taxonomy

Two parallel category systems: **topics** (`topics` table, one per post via `posts.topic_id`, primary grouping) and **tags** (`text[]` column on `posts`, secondary/filter labels). Both are surfaced through the editor's autocomplete, backed by `db/queries/taxonomy.ts` and `db/queries/posts.ts`, and created/assigned via the existing post-save Server Action path (no separate "create topic" endpoint).

### Content storage

MDX body lives in the `posts.content_mdx` column (not `content`). Legacy filesystem posts under `content/posts/*/index.mdx` are the pre-Supabase format, importable via `npm run supabase:import-posts`. MDX images must use relative paths (`./assets/...`); use `ClientMDXRemote` (`components/mdx/client-mdx-remote.tsx` / `features/posts/components/mdx/`) for editor preview to avoid `next/image` remote-hostname whitelist issues.

### Terminology

UI copy always says **"Stories"**; database/code identifiers keep `post`/`posts` — don't rename the schema to match UI copy.
