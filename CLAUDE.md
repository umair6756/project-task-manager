# Master Prompt Pack — Build "FlowForge" (Productivity Super-App) with Claude

How to use:
- **Section A** = MASTER PROMPT → save as `CLAUDE.md` (Claude Code) or send first.
- **Section B** = PHASE PROMPTS → one at a time. Phases 1–8 = complete backend. Phases 9–14 = frontend. This matches your backend-first requirement.
- **Section C** = reusable follow-ups.

---

## SECTION A — MASTER PROMPT (CLAUDE.md)

```
# PROJECT: FlowForge — personal productivity super-app (projects, tasks,
# learning tracker, notes, habits, goals, time tracking, reviews, analytics)

You are my senior backend + frontend engineer. We build BACKEND FIRST as a
complete, tested, documented REST API; only then the frontend. This brief is
the single source of truth.

## 1. PRODUCT SCOPE (modules)

A. Platform: JWT auth (access 15m + refresh 7d rotation, revocation), profile,
   settings, global search, activity log, soft-delete + trash (30d), data
   export/import (JSON), API keys, outgoing webhooks, notifications.
B. Areas & Projects: areas -> projects (status, priority, deadline, color,
   icon), milestones, templates (instantiate with date shifting), progress %
   auto from tasks or manual, health indicator, archive.
C. Tasks: natural-language quick-add parsing ("pay bill tomorrow 5pm p1
   #home"), statuses (todo/in-progress/blocked/done/cancelled), priorities
   P1-P4, due/start dates, RECURRENCE (RRULE subset: daily/weekly/monthly/
   custom interval + weekday sets; two modes: spawn-next-on-complete and
   fixed-schedule), nested subtasks, checklists, labels, dependencies
   (blocked-by), estimates, reminders (multiple), snooze, batch ops, manual
   sort order, saved filters (structured query), comments, attachments,
   duplicate, convert note<->task, activity history.
D. Notes: markdown, notebooks hierarchy, tags, [[wiki-links]] with backlinks,
   daily notes, templates, version history (last 20), full-text search,
   image attachments, favorites, task-checkbox sync, export markdown.
E. Learning: items (course/book/video/article) with status pipeline and
   progress units (%/pages/lectures/hours), progress history, skills with
   levels 1-5, certificates (file + expiry reminder), sections checklist,
   FLASHCARDS with SM-2 spaced repetition (decks, cards, daily due queue,
   review grading Again/Hard/Good/Easy, retention stats), learning goals,
   streaks, dashboard stats.
F. Habits: daily/x-per-week/weekday schedules, positive/negative, quantified
   targets, one-tap check-in, streaks with grace period (day-end hour
   setting) and skip-with-reason, heatmap data, routines (ordered habit
   groups with run mode), reminders, strength score.
G. Goals (OKR): yearly/quarterly/monthly goals, key results (number/percent/
   boolean), AUTO-BOUND KRs (bind to: tasks completed in project, habit
   completion rate, learning hours — recomputed by jobs), roll-up progress,
   check-ins with reflections, traffic-light status.
H. Time & Focus: timers on tasks/learning items (one running timer per user,
   enforced), manual entries, pomodoro sessions, daily timeline, reports by
   project/label/area, estimates-vs-actuals, weekly time budgets per area.
I. Planning & Reviews: inbox capture, Today/Upcoming smart views, MITs (pick
   3 daily), daily plan + shutdown rituals, WEEKLY REVIEW wizard (server
   provides the aggregated data package), journal with mood 1-5, weekly
   email report, monthly trends, year-in-review aggregation.
J. Analytics & Gamification: daily productivity score, trends, personal
   records, XP/levels, achievements engine (event-driven, 50 seed badges),
   burndown/cumulative-flow per project, best-hours analysis.
K. Later: rules automation engine, BYOK AI endpoints, Google Calendar sync,
   Telegram bot, iCal feed.

Multi-user-ready (every doc has userId, all queries scoped) but single-user
product for now. I am the user; polish for daily personal use.

## 2. TECH STACK (fixed — ask before substituting)

Backend: Node.js 20, Express, TypeScript strict, Mongoose 8 + MongoDB
(Atlas free tier; local Docker mongo for dev), Zod for ALL validation
(schemas in packages/shared, reused by frontend later), JWT + bcrypt,
Agenda (Mongo-backed jobs) + node-cron, Socket.io, Nodemailer/Resend,
multer -> local uploads dev / S3-compatible R2 prod, swagger-jsdoc +
swagger-ui (OpenAPI must stay accurate — it is the frontend contract),
pino logger, helmet + rate limiting, Vitest + Supertest +
mongodb-memory-server.

Frontend (Phases 9+): React 18 + Vite + TS, TanStack Router + TanStack Query,
Zustand (UI state), Tailwind + shadcn/ui, dnd-kit, Recharts, CodeMirror 6
(markdown editor), FullCalendar, cmdk (command palette), date-fns, sonner
(toasts). PWA via vite-plugin-pwa.

Monorepo: pnpm workspaces -> apps/api, apps/web, packages/shared.

## 3. BACKEND ARCHITECTURE RULES

- Layered: routes -> controllers (thin) -> services (ALL business logic) ->
  models. Cross-cutting middleware: auth, zod-validate, error handler
  (typed AppError), activity logger, rate limiter.
- Every endpoint: zod-validated input, consistent response envelope
  { success, data, error }, OpenAPI-documented, covered by at least one
  Supertest happy-path + one failure test. Services with tricky logic
  (recurrence, SRS, streaks, KR binding, score) get dedicated unit suites.
- Mongoose: schemas with strict types; compound indexes for every list
  query (e.g., tasks: {userId, status, dueDate}, {userId, projectId,
  sortOrder}); text indexes for search; TTL index on activity logs (180d);
  soft-delete via deletedAt + query helpers that exclude by default.
- Embed vs reference: embed subtasks/checklists/reminders in task; reference
  timeEntries, comments, habitLogs, cardReviews (queried independently).
- Analytics via aggregation pipelines in services — never fetch-all-and-loop.
- Dates: store UTC; all "day" logic (streaks, today views, heatmaps) respects
  user timezone + custom day-end hour. Centralize in a dateService. This is
  the #1 bug source — test it hard (DST, timezone edges, 3am day-end).
- Jobs (Agenda): reminder dispatch, fixed-schedule recurrence spawner
  (idempotent!), SRS due recalculation, KR auto-binding recompute (hourly),
  weekly report build+email, webhook delivery with retries, trash purge.
- Realtime: Socket.io rooms per userId; emit events (task.updated,
  timer.tick, notification.new) — frontend will subscribe later.

## 4. FRONTEND ARCHITECTURE RULES (apply from Phase 9)

- TanStack Query for ALL server state (no server data in Zustand); optimistic
  updates for completes/check-ins/reorders with rollback on error.
- Feature-folder structure: src/features/<module>/ (components, hooks, api).
- Advanced UX bar: command palette (cmdk) with actions + navigation, full
  keyboard shortcuts map, virtualized long lists, skeleton loaders,
  drag-and-drop (dnd-kit) for reorder/kanban/time-blocking, undo toasts,
  empty states with guidance, 60fps interactions, mobile-responsive.
- Design: clean, dense-but-breathable dashboard aesthetic; dark mode first;
  consistent 4/8px spacing scale; shadcn/ui as base, customized (not
  default-looking). Follow the frontend-design skill if available.
- PWA: installable, cache-first shell, offline read for today view + notes.

## 5. CODE QUALITY (non-negotiable)

- MINIMAL code per phase; no speculative abstraction. Small files (<200
  lines target). TS strict, zero `any`. Early returns.
- Comments: top-of-file WHAT/WHY; inline only where non-obvious (SRS math,
  recurrence spawning, streak/timezone logic, score weights). These four get
  GENEROUS comments — I will tune them later.
- Never break the OpenAPI contract silently; contract changes are called out
  in the phase summary.
- Every phase ends runnable: API boots, tests green, swagger reflects truth.

## 6. HOW WE WORK

- I announce the phase. Plan first (files, endpoints, decisions, questions);
  proceed unless a decision needs me. After: summary, how to test manually
  (curl/swagger for backend phases), deferred items.
- Backend phases MUST NOT include frontend code, and vice versa.

Confirm with a 5-bullet summary + expected phase list, then wait for Phase 1.
```

---

## SECTION B — PHASE PROMPTS

### — BACKEND (Phases 1–8) —

### Phase 1 — Foundation & auth
```
PHASE 1 (backend).
1. Monorepo scaffold (pnpm: apps/api, packages/shared). Express + TS app
   with layered structure, pino, helmet, CORS, rate limiter, error handler,
   response envelope, health endpoint. Docker compose: local mongo.
2. packages/shared: base zod schemas (auth, user, pagination) — pattern all
   future modules follow.
3. Auth: register, login, refresh (rotation + revocation collection),
   logout, forgot/reset password (email via Nodemailer console transport in
   dev), me endpoint. bcrypt(12). Auth middleware.
4. Users: profile update (name, avatar upload via multer, timezone,
   weekStartDay, dayEndHour), settings blob endpoint.
5. Swagger at /docs generated from route JSDoc; Vitest+Supertest setup with
   mongodb-memory-server; tests: register/login/refresh/reset flows.
6. Activity log middleware (records mutating requests) with TTL index.
7. .env.example documented; README run guide.
```

### Phase 2 — Areas, Projects, Labels
```
PHASE 2 (backend).
Models+CRUD+tests+swagger for: areas (name, icon, color, sortOrder),
projects (area ref, name, description, status idea/active/paused/done/
archived, priority, deadline, color, icon, progressMode auto|manual,
manualProgress, pinned), milestones (project ref, title, dueDate, done),
labels (name, color). Project endpoints extra: archive/restore, pin,
progress computation service (auto mode = done tasks / total tasks — wire
fully in Phase 3 and stub now), health indicator service (deadline vs
progress heuristic — document the formula in comments), template save +
instantiate (deep-copy project+milestones+tasks with date shifting by delta
between old and new start; tasks copied in Phase 3, design for it now).
Soft delete + trash endpoints (list, restore, purge) generic across models
via a shared plugin.
```

### Phase 3 — Tasks engine (biggest backend phase — take care)
```
PHASE 3 (backend).
1. Task model per master brief: embedded subtasks (nested one level),
   checklist, reminders[], labels[], projectId, milestoneId, status,
   priority, dueAt, startAt, estimateMin, sortOrder, dependsOn[],
   recurrence {rrule-subset json, mode spawn|fixed}, meta. Indexes per brief.
2. CRUD + batch operations endpoint (multi-id: status/label/project/
   reschedule) + duplicate + convert note<->task placeholder interface.
3. Natural-language quick-add parser service: extracts date/time (today,
   tomorrow, mon, 15 aug, 5pm), priority (p1-p4), labels (#tag), project
   (@project by name) — pure function, big unit-test suite of phrasings.
   Parsing runs server-side: POST /tasks/quick-add {text}.
4. RECURRENCE service (heavily commented + dedicated test suite):
   - spawn mode: on completing a recurring task, compute + create next
     occurrence.
   - fixed mode: Agenda job (idempotent, runs hourly) materializes upcoming
     occurrences 14 days ahead; completing one never affects the schedule.
   - supports: every N days/weeks/months, weekday sets, end-by date/count.
5. Dependencies: completing a task blocked by unfinished deps returns a
   warning flag the client must confirm-override.
6. Smart view endpoints (server-computed, timezone-aware via dateService):
   /views/today (overdue + due today + startAt today + MITs), /views/upcoming
   ?days=7|30, /views/inbox (no project), /views/anytime. Saved filters:
   CRUD + execute (structured query: status/priority/labels/project/date
   ranges — translate to safe Mongo queries, never raw user queries).
7. Reminders: Agenda dispatch -> notification collection + socket emit +
   (email if enabled). Snooze endpoint.
8. Comments + attachments subroutes. Activity history per task.
Tests: recurrence suite (both modes, month-end edges, DST), parser suite,
today-view timezone suite (incl. 3am day-end), dependency warnings.
```

### Phase 4 — Notes & knowledge base
```
PHASE 4 (backend).
Notebooks (hierarchy via parentId), notes (title, markdown content, tags,
notebookId, pinned, favorited, linkedTaskIds, linkedProjectIds), text index
+ search endpoint with snippet highlighting, [[wiki-link]] parsing service:
on save, extract links -> store noteLinks collection -> backlinks endpoint +
graph endpoint (nodes+edges for the whole user). Daily note endpoint
(get-or-create by date). Templates CRUD + create-from-template. Version
history: store last 20 revisions (separate collection, capped per note),
list + restore endpoints. Image upload for notes. Checkbox sync: parse
"- [ ]" lines flagged with a task marker -> create/update linked real tasks
(document the sync rules carefully in comments; one-way note->task with
completion syncing both ways). Export note as .md download.
```

### Phase 5 — Learning tracker + spaced repetition
```
PHASE 5 (backend).
1. learningItems (type, title, source, url, status pipeline, progressUnit
   %/pages/lectures/hours, progressCurrent/Target, sections[] checklist,
   skills[], takeaways, linked noteIds), progress-update endpoint appending
   to progressHistory[], stats endpoints (hours via timeEntries link —
   stub until Phase 7, items by status, completion pace).
2. skills (name, level 1-5, category) + mapping endpoints + skill radar
   aggregation.
3. certificates (file upload, issuer, expiresAt) + expiry reminder job.
4. FLASHCARDS: decks, cards (front/back markdown, srs: {ease, intervalDays,
   dueAt, reps, lapses, state new|learning|review}). SM-2 service (pure,
   generously commented, dedicated unit suite: grade Again/Hard/Good/Easy
   transitions, lapse handling, learning steps 1m/10m simplified to
   same-day). Endpoints: due queue (respect timezone day boundaries),
   review submit, deck stats (retention %, due forecast 7d), review
   heatmap aggregation, bulk card create (for future AI import).
5. Learning streak service (any progress update or review counts).
```

### Phase 6 — Habits, routines, goals (OKR)
```
PHASE 6 (backend).
1. habits (name, icon, color, type positive|negative, schedule {daily |
   perWeek n | weekdays[]}, quantTarget?, reminderTimes[], graceApplied via
   user dayEndHour, archived), habitLogs (date, done|skipped {reason}|value),
   check-in endpoint (idempotent per day), streak service (current + best;
   schedule-aware: perWeek habits streak by week; skip preserves; heavily
   commented + test suite incl. timezone/day-end edges), heatmap aggregation
   (year), completion-rate stats (7/30/90d), strength score (documented
   weighted formula).
2. routines (ordered habitIds, timeOfDay) + run-mode session endpoints.
3. goals (horizon year|quarter|month, title, theme, status), keyResults
   (type number|percent|boolean, start/target/current, binding: null |
   {kind: tasksCompletedInProject|habitCompletionRate|learningHours,
   refId, window}), check-ins (value updates + reflection text). Binding
   recompute service + hourly Agenda job (aggregation pipelines). Roll-up
   progress + traffic-light status service. Goal<->project/habit/learning
   link endpoints.
```

### Phase 7 — Time tracking, planning, reviews, journal
```
PHASE 7 (backend).
1. timeEntries (taskId?|learningItemId?, start, end?, source timer|manual|
   pomodoro, note, billable?): start/stop endpoints enforcing ONE running
   timer per user (409 with current timer info), manual CRUD with overlap
   validation, pomodoro session endpoints (workLen, breakLen, cycles).
2. Reports (aggregations): time by project/label/area for range, daily
   timeline, estimates-vs-actuals per project, weekly area budgets
   (areaBudgets setting) with consumed %, deep-work heat by hour.
3. MITs: set/get up to 3 task refs per day. Daily plan + shutdown endpoints
   (structured payloads saved per day).
4. journalEntries (date, mood 1-5, text) + mood-vs-productivity correlation
   aggregation (document formula).
5. WEEKLY REVIEW: GET /reviews/week/:isoWeek returns the full aggregated
   package (completed stats, time by area, habit rates, overdue list,
   inbox count, goal statuses, prompts); POST saves answers + actions
   (batch reschedule endpoint reuse). Monthly + year-in-review aggregation
   endpoints (define the interesting stats, wrapped-style).
6. Weekly email report job (HTML email from the same aggregation).
```

### Phase 8 — Analytics, gamification, platform polish (backend freeze)
```
PHASE 8 (backend).
1. Daily productivity score service (documented weights: tasks done w/
   priority, focus minutes, habit rate, MITs done) + daily snapshot job ->
   scores collection + trends endpoints (velocity, completion rate,
   overdue ratio, best-hours histogram, postpone/procrastination report,
   personal records).
2. Gamification: event-driven achievements engine (services emit domain
   events -> engine checks rules), 50 seeded achievements across modules,
   XP table + level curve (documented), endpoints for earned/progress;
   streak-freeze tokens (earn rules + spend endpoint integrated into habit
   streak service).
3. Project burndown + cumulative flow aggregations.
4. Global search endpoint across tasks/notes/projects/learning (parallel
   text queries, merged ranked results).
5. Platform: full JSON export (all user data) + import with id remapping;
   API keys (scoped, hashed) + key auth middleware; outgoing webhooks
   (events config, HMAC signature, Agenda delivery with 3 retries).
6. Coverage pass: every service with logic has unit tests; API test suite
   green; OpenAPI complete. Tag repo: backend-v1. BACKEND FREEZE — frontend
   phases may not change API behavior without an explicit contract-change
   note.
```

### — FRONTEND (Phases 9–14) —

### Phase 9 — Frontend foundation + auth + shell
```
PHASE 9 (frontend). Read the frontend architecture rules in CLAUDE.md.
1. apps/web scaffold: Vite + React 18 + TS strict, Tailwind + shadcn/ui
   (customized theme: dark-first, accent variable), TanStack Router +
   Query (client from OpenAPI types — generate types package from the
   swagger spec into packages/shared), Zustand for UI state, sonner.
2. Auth pages (login/register/forgot/reset), token handling (memory access
   + httpOnly-style refresh via api; interceptors with auto-refresh).
3. App shell: sidebar (Areas/Projects tree, smart views, modules), topbar
   (global search stub, timer widget stub, notifications), theme toggle,
   responsive drawer on mobile.
4. Command palette (cmdk): navigation + "create task/note" actions
   registered via a palette registry other features will extend.
5. Keyboard shortcut system (registry + cheat-sheet modal, '?').
6. Socket.io client with auth + reconnect; notification toasts wired.
```

### Phase 10 — Tasks UI (biggest frontend phase)
```
PHASE 10 (frontend).
1. Quick-add bar (global, 'q' shortcut): free text -> /tasks/quick-add,
   parsed chips preview (date/priority/label/project) before confirm.
2. List view: grouping (project/date/priority/label), virtualized,
   inline edit, complete with optimistic update + undo toast, batch
   multi-select bar, drag reorder (dnd-kit) persisting sortOrder.
3. Task detail panel (side peek): all fields, subtasks with drag reorder,
   checklist, dependencies picker with blocked warnings, reminders,
   comments, attachments, activity tab, recurrence editor UI (both modes,
   human-readable summary: "every 2 weeks on Mon, Fri").
4. Kanban per project: dnd columns by status, WIP count badges.
5. Calendar view (FullCalendar): month/week, drag to reschedule, click to
   time-block (creates start/due times).
6. Smart views: Today (MIT picker at top: choose 3), Upcoming, Inbox with
   triage buttons, Anytime; saved filter builder UI + pinned filters in
   sidebar.
7. Every interaction keyboard-accessible; palette actions for complete/
   reschedule/goto.
```

### Phase 11 — Notes + Learning UI
```
PHASE 11 (frontend).
1. Notes: three-pane (notebooks tree / note list / editor). CodeMirror 6
   markdown with live preview toggle, slash menu, syntax-highlighted code
   blocks, image paste-upload, [[link]] autocomplete, backlinks panel,
   version history drawer with restore, daily note shortcut (today icon),
   graph view page (force-directed, click to open), templates picker,
   note->task checkbox sync indicators.
2. Learning: items board by status, item page (progress quick +buttons,
   sections checklist, linked notes, takeaways, time invested), skills
   radar chart, certificates grid with expiry badges, learning dashboard
   (hours/week chart, streak, active items).
3. Flashcards: deck list with due counts, REVIEW MODE (full-screen card,
   flip animation, Again/Hard/Good/Easy with keyboard 1-4, session
   progress, end-of-session stats), retention charts + review heatmap,
   card editor with markdown preview.
```

### Phase 12 — Habits, Goals, Time & Focus UI
```
PHASE 12 (frontend).
1. Habits: today strip on dashboard (one-tap check-in with satisfying
   micro-animation), habits page (heatmaps, streaks, strength, stats),
   quantified habit steppers, skip-with-reason dialog, routine run mode
   (full-screen stepper with per-habit timers).
2. Goals: OKR tree view (goal -> KRs with progress bars, traffic lights),
   check-in flow with reflection, bound-KR badges showing auto source,
   goal timeline, year themes header.
3. Time: persistent timer widget in topbar (running task name, elapsed,
   stop; socket-synced across tabs), start-timer buttons on tasks/learning,
   pomodoro focus mode (full-screen, ambient progress ring, cycle dots,
   distraction quick-log), manual entry dialog with overlap warnings,
   reports page (time by area/project charts, estimates vs actuals, deep-
   work heat, weekly budgets bars).
```

### Phase 13 — Dashboard, reviews, analytics, gamification UI
```
PHASE 13 (frontend).
1. Home dashboard: widget grid (today tasks, MITs, habits strip, timer,
   streaks, calendar peek, quote, goals glance) with edit mode (show/hide/
   reorder, persisted).
2. Daily rituals: morning plan flow (triage inbox -> pick MITs -> time-block
   suggestion) and shutdown flow (review, journal with mood, plan tomorrow).
3. Weekly review wizard: multi-step using the server package (stats recap ->
   reflections -> overdue triage with batch reschedule -> goal check-ins ->
   done screen with confetti). Monthly review + Year-in-review pages
   (wrapped-style scrolling stats).
4. Analytics: trends dashboards (score line, velocity, completion, best
   hours, procrastination table), project burndown/CFD, life balance wheel.
5. Gamification: XP/level in sidebar footer, achievements gallery
   (earned/locked with progress), streak-freeze token UI, milestone confetti.
6. Journal page with mood calendar + correlation chart.
```

### Phase 14 — Platform UI, PWA, polish
```
PHASE 14 (frontend).
1. Global search (palette-integrated + dedicated page, grouped results).
2. Settings: profile, appearance (accent picker), day-end hour, week start,
   area budgets, notifications matrix, API keys manager, webhooks manager,
   data export/import, trash browser with restore.
3. Notifications center (socket live + read states).
4. PWA: install prompt, offline shell + cached Today/notes-read, update
   toast on new version.
5. Polish pass: empty states everywhere, skeletons, error boundaries,
   focus rings, reduced-motion support, Lighthouse (aim 90+ perf/a11y),
   mobile audit of all core flows.
6. README: screenshots, architecture diagram, feature matrix vs the
   208-feature catalog with status column. Tag v1.0. Then we live on the
   "forever backlog" (rules engine, AI BYOK, calendar sync, Telegram bot)
   via Section C prompts.
```

---

## SECTION C — REUSABLE PROMPTS

**Module review:**
```
Strict senior review of the last phase: layering violations (logic in
controllers?), missing zod validation, missing indexes for new queries,
timezone bugs (anything using new Date() without dateService?), untested
service logic, OpenAPI drift, and frontend: server state in Zustand,
missing optimistic rollback, unvirtualized long lists. Rank by severity, fix.
```

**Add feature from the catalog:**
```
NEW FEATURE #<n> from the proposal catalog: <name>.
Plan first: endpoints/model changes (backend) and/or components (frontend),
contract changes flagged, minimal design consistent with CLAUDE.md. Wait for
my go, then implement with tests.
```

**Bug fix:**
```
BUG: <actual> vs EXPECTED: <expected>. Repro: <steps>. Payload/logs: <paste>.
Root cause in 2-3 sentences, minimal fix, regression test if it touches
recurrence/SRS/streaks/timezone/score logic.
```

**Formula tuning (score/strength/SM-2):**
```
I want to adjust the <productivity score|habit strength|SM-2> behavior:
<describe desired change>. Show me the current formula from the code
comments, propose the minimal parameter/logic change, update comments and
its unit tests together.
```

---

## Tips

1. **Claude Code + `CLAUDE.md`.** Start sessions with: "Read CLAUDE.md. Phases 1–5 done. Start Phase 6."
2. **Dogfood from Phase 10** — the moment tasks UI exists, run the app daily; your annoyances become the truest backlog.
3. **Commit + tag per phase**; `backend-v1` tag after Phase 8 is your API freeze line.
4. The four logic hotspots (recurrence, SM-2, streak/timezone, scoring) are deliberately isolated, commented, and test-covered — when something feels wrong in daily use, use the Formula-tuning prompt instead of hand-editing.
5. Don't chase all 208 features — the catalog is a menu, not a contract. Ship, use, iterate.
