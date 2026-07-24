# FlowForge

Personal productivity super-app (projects, tasks, notes, learning tracker
with spaced repetition, habits, OKR goals, time tracking, reviews,
analytics, gamification). Built backend-first as a documented REST API,
then a React frontend on top of it — see `CLAUDE.md` for the full spec and
phase plan this was built from.

## Status: v1.0 — all 14 phases complete

Backend (Phases 1–8) and frontend (Phases 9–14) are both done. The backend
is frozen as of `backend-v1` (tag) — any further API changes should be
called out explicitly rather than made silently underneath the frontend.

## Architecture

```
apps/api/             Express + TypeScript REST API
  src/
    config/            env, logger, swagger, mongoose global config
    db/                mongoose connection, soft-delete plugin
    middleware/         auth, validate, error handler, rate limit, activity log
    modules/<name>/     routes -> controller -> service -> model, per feature
    jobs/               Agenda background jobs (reminders, recurrence, KR binding, etc.)
    utils/              AppError, response envelope, asyncHandler, dateService, email

apps/web/              React 18 + Vite + TypeScript frontend
  src/
    app/                router (code-based TanStack Router), ErrorBoundary
    components/ui/      hand-built shadcn-style primitives (Button, Input, Skeleton...)
    features/<name>/     one folder per module: hooks (TanStack Query) + components
    stores/              Zustand UI state (auth, theme)
    lib/                 apiClient (auto-refresh), socket.io client, cn()

packages/shared/       Zod schemas shared between API and web (validation +
                        inferred TS types), single source of truth for both.
```

**Data flow**: routes are zod-validated → thin controllers → services hold
all business logic → Mongoose models. The frontend never talks to Mongo
directly; every `features/<module>/use*.ts` hook wraps a documented
endpoint and is typed against the same envelope (`{ success, data, error }`)
the backend actually returns.

## Feature matrix

| Module | Backend | Frontend | Notes |
|---|---|---|---|
| Auth (JWT rotation, register/login/reset) | ✅ | ✅ | access token in memory, refresh in localStorage |
| Areas / Projects / Labels / Trash | ✅ | ✅ (trash browser in Settings) | generic soft-delete plugin across 14 models |
| Tasks (quick-add, recurrence, dependencies) | ✅ | ✅ | list/kanban/calendar/smart-views, drag-reorder, batch ops, virtualized lists |
| Saved filters | ✅ | ✅ | builder UI + pinned chip strip |
| Notes (wiki-links, backlinks, daily notes) | ✅ | ✅ | 3-pane layout, plain-textarea markdown editor (see gotcha below), hand-rolled graph view |
| Learning items + skills + certificates | ✅ | ✅ | status board, progress tracking, skill radar chart |
| Flashcards (SM-2 spaced repetition) | ✅ | ✅ | full-screen review mode, retention/forecast charts, review heatmap |
| Habits + routines | ✅ | ✅ | one-tap check-in, skip-with-reason, heatmaps, routine run-mode stepper |
| Goals (OKR, auto-bound key results) | ✅ | ✅ | traffic-light status, check-in flow, bound-KR badges |
| Time tracking + pomodoro | ✅ | ✅ | persistent timer widget (topbar), ambient pomodoro focus mode |
| Time reports | ✅ | ✅ | time-by-project/area, deep-work heat, area budgets |
| Planning (MITs, daily plan, shutdown ritual) | ✅ | ✅ | dashboard widget + shutdown flow dialog |
| Journal + mood correlation | ✅ | ✅ | mood calendar heatmap, mood-vs-productivity chart |
| Weekly/monthly/year-in-review | ✅ | ✅ | 5-step weekly wizard w/ real batch-reschedule |
| Analytics (trends, burndown/CFD) | ✅ | ✅ | velocity/completion/procrastination, project flow charts |
| Gamification (XP, 50 achievements, streak-freeze) | ✅ | ✅ | sidebar XP footer, achievements gallery |
| Global search | ✅ | ✅ | live in command palette + dedicated `/search` page |
| Settings (profile, appearance, notifications) | ✅ | ✅ | accent color persists via CSS var + settings blob |
| API keys / webhooks | ✅ | ✅ | one-time secret reveal on creation |
| Data export/import | ✅ | ✅ | full JSON round-trip, ids always remapped fresh |
| PWA (installable, offline shell) | — | ✅ | see PWA section below |
| Life balance wheel | — | ❌ | not built — noted as a follow-up |

## Run locally

```bash
# 1. install deps (from repo root — pnpm workspace)
pnpm install

# 2. start local MongoDB
docker compose up -d

# 3. configure env
cp apps/api/.env.example apps/api/.env
# edit apps/api/.env if you want to point at Atlas instead of local mongo

# 4. run the API in dev mode
pnpm dev:api
# -> http://localhost:4000/docs      (Swagger UI)
# -> http://localhost:4000/health    (liveness check)

# 5. in a second terminal, run the web frontend
pnpm --filter @flowforge/web dev
# -> http://localhost:5173           (proxies /api and /socket.io to :4000)
```

## Test

```bash
pnpm test:api
```

Tests use `mongodb-memory-server` — no running Mongo needed to run the
suite. 236 tests across the 8 backend modules.

## PWA

The web app is installable (`vite-plugin-pwa`, `generateSW` strategy):
- Precached app shell for offline boot.
- Network-first runtime caching (3s timeout) for `/api/views/today` and
  `/api/notes*`, so the Today view and notes still render something when
  offline.
- An install-prompt banner appears when the browser fires
  `beforeinstallprompt`; a reload toast appears when a new service-worker
  version is available.

## Known gaps / accepted simplifications

- **Markdown editor is a plain `<textarea>`**, not CodeMirror 6 as
  originally speced — `@uiw/react-codemirror` failed 5 consecutive install
  attempts in the dev sandbox this was built in (deterministic failure on
  one specific package, unrelated to the general network flakiness other
  installs hit). Fully functional, just no syntax highlighting.
- **Timer widget polls every 5s** rather than being pushed over the
  socket — the backend only ever emits `notification.new`, no `timer.tick`
  event exists.
- **Learning-item section checkboxes are read-only** in the UI — the
  update schema's `sections` field doesn't accept a `done` value, so there's
  no way to toggle it via the current API contract.
- **No per-entity deep links yet** — search results and command-palette
  hits navigate to the parent list page (e.g. `/tasks`), not a specific
  task's detail view by URL.
- **Dashboard layout (widget order/visibility) is localStorage-only**, not
  synced to the backend — there's no settings field for it.
- Wiki-link insertion is a search-and-insert popover, not true in-editor
  `[[` autocomplete (would need a custom text-editor extension).

## Architecture rules (see CLAUDE.md for full detail)

- Layered: routes → controllers (thin) → services (all business logic) → models.
- Every endpoint: zod-validated, `{ success, data, error }` response envelope,
  documented in Swagger via `@openapi` JSDoc on the route file.
- Every module ships with Supertest happy-path + failure-path tests.
- Multi-user-ready: every document carries `userId`; all queries scope by it.
- Frontend: TanStack Query owns all server state (nothing server-derived
  lives in Zustand), optimistic updates with rollback on the mutations that
  benefit from it (task complete/reorder/update).

## Manual smoke test (curl)

```bash
curl -s http://localhost:4000/health | jq

curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password123","name":"You"}' | jq

# copy accessToken from the response above
curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <accessToken>" | jq
```
