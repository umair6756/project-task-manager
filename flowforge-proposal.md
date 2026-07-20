# Project Proposal: "FlowForge" — Personal Productivity Super-App

*(Working name. Your all-in-one: projects + tasks + learning tracker + notes + habits + goals + time tracking + reviews — built for YOU first, product later.)*

---

## 1. Executive Summary

FlowForge is a personal productivity platform combining what normally takes 5+ apps (Notion, Todoist, Trello, Toggl, habit trackers) into one fast, keyboard-driven app:

- **Projects & task management** (lists, kanban, calendar, timeline)
- **Learning tracker** (courses, books, skills, spaced-repetition flashcards)
- **Progress & goals** (OKR-style goals, streaks, metrics, analytics)
- **Notes & knowledge base** (markdown, backlinks, tags)
- **Habits, time tracking, daily planning, weekly reviews**

**Stack (your choice, confirmed):** Node.js backend (Express + Mongoose) with **MongoDB**, built **backend-first** as a clean REST API, then an advanced React frontend. This also makes it a portfolio-grade full-stack project.

**Cost:** $0 — MongoDB Atlas free tier (512 MB), free hosting tiers, no paid APIs. Optional AI features use BYOK.

---

## 2. Why This Project Is Smart for You

1. You use it daily → endless real feedback loop.
2. It exercises every full-stack skill: auth, complex data modeling, aggregation pipelines, caching, real-time, advanced UI state.
3. Every module is a portfolio talking point; later it can become a SaaS (multi-user is designed in from day one, just not exposed).

Competitors (for context, not competition — this is personal-first): Notion (heavy, slow), Todoist (tasks only), Habitica (gamified but shallow), TickTick (closest, closed-source). Your edge: everything integrated + your exact workflow + free forever.

---

## 3. Feature Catalog (200+ features, organized by module)

> Build order note: ✅-marked modules are MVP (Phases 1–6). The rest are numbered phases in the prompt pack. Don't build all 200 before using the app — ship module by module.

### A. Core Platform & Auth ✅ (18)
1. Email/password signup–login (JWT access + refresh tokens) 2. Refresh-token rotation & revocation 3. Password reset via email 4. Profile (name, avatar, timezone, week-start day) 5. Theme: dark/light/system + accent colors 6. Global search across all modules (Mongo text indexes) 7. Command palette (Ctrl+K) for navigate/create/complete anything 8. Keyboard shortcuts everywhere + shortcut cheat-sheet modal 9. Undo toast for destructive actions 10. Soft delete + Trash with 30-day restore 11. Full data export (JSON) 12. Data import (JSON; Todoist/CSV importers later) 13. Activity log (everything you did, per day) 14. Settings sync across devices 15. PWA: installable, offline read cache 16. Rate limiting + helmet + input validation on every endpoint 17. API keys for personal scripting/automation 18. Webhooks out (task.completed, habit.done...) for personal automations

### B. Projects & Areas ✅ (16)
19. Areas (Life buckets: Work, Health, Learning...) 20. Projects with color, icon, description 21. Project statuses (idea/active/paused/done/archived) 22. Project priority & deadline 23. Project progress % (auto from tasks, or manual) 24. Milestones within projects 25. Project templates (save any project as template) 26. Instantiate template with date-shifting 27. Project notes tab 28. Project files/links attachments 29. Pinned/favorite projects 30. Project archive view 31. Per-project default task settings 32. Project health indicator (on-track/at-risk by deadline vs progress) 33. Project timeline (Gantt-lite) 34. Cross-project dependencies flag

### C. Tasks & Todos ✅ (34)
35. Quick-add with natural language ("pay bill tom 5pm p1 #home") 36. Title, rich description (markdown) 37. Statuses: todo/in-progress/blocked/done/cancelled 38. Priorities P1–P4 with colors 39. Due date + optional time 40. Start/defer date (hide until) 41. Recurring tasks (daily/weekly/monthly/custom RRULE: "every 2nd Mon") 42. Recurrence: complete-spawns-next vs fixed-schedule modes 43. Subtasks (nested, with own checkboxes) 44. Checklists inside tasks 45. Labels/tags (colored, multi) 46. Task ↔ project assignment 47. Task ↔ note links 48. Dependencies (blocked-by; can't complete blocker warnings) 49. Estimates (time) vs actual (from time tracking) 50. Reminders (in-app + email; multiple per task) 51. Snooze task 52. Batch operations (multi-select: move/label/reschedule/complete) 53. Drag-and-drop reordering (manual sort persisted) 54. Kanban board per project (customizable columns = statuses) 55. List view with grouping (by project/date/priority/label) 56. Calendar view (month/week; drag to reschedule) 57. "Today" smart view (due + scheduled + overdue) 58. "Upcoming" view (next 7/30 days) 59. "Anytime/Someday" views 60. Overdue auto-rollover option 61. Saved custom filters (query builder: status+label+project+date) 62. Task activity history 63. Task comments (self-notes with timestamps) 64. File/link attachments 65. Duplicate task 66. Convert task→project, note→task 67. Time-block tasks onto calendar 68. Postpone-streak warning ("you've moved this 5×— split it?")

### D. Notes & Knowledge Base ✅ (22)
69. Markdown editor with live preview 70. Slash commands (/h1, /todo, /table, /code) 71. Code blocks with syntax highlighting 72. Notebooks/folders hierarchy 73. Tags on notes 74. Backlinks: [[wiki-links]] between notes with backlink panel 75. Graph view of note links 76. Daily notes (auto-created journal page per day) 77. Note templates (meeting, book summary, decision log) 78. Pin notes 79. Full-text search with highlight 80. Attach images (upload) 81. Tables editor 82. Task embedding: checkboxes in notes sync as real tasks (flagged) 83. Note version history (last 20 revisions) 84. Word count & reading time 85. Export note to Markdown/PDF 86. Web clipper input endpoint (save URL+excerpt via API/bookmarklet) 87. Read-later list with status 88. Note linking to projects/tasks/learning items 89. Favorites sidebar 90. Recently edited list

### E. Learning Tracker ✅ (26)
91. Learning items: course/book/video/article/tutorial types 92. Status pipeline: wishlist→learning→completed→abandoned 93. Progress units: % or pages or lectures or chapters or hours 94. Update progress with one click (+1 lecture, +10 pages) 95. Progress history chart per item 96. Platform/source + URL field 97. Estimated vs actual time invested (links to time tracker) 98. Skills taxonomy (e.g., Node.js, DevOps) with levels 1–5 self-rating 99. Skill ↔ learning-item mapping (finishing items suggests level-up) 100. Learning goals ("finish 2 courses/month") 101. Notes per learning item (linked notes) 102. Key takeaways field (spaced summary) 103. Certificates vault (upload + expiry reminders) 104. Reading list with priority order 105. Course sections/modules checklist 106. **Flashcards**: decks, cards (front/back, markdown) 107. Spaced repetition scheduler (SM-2 algorithm) 108. Daily review queue ("18 cards due") 109. Review stats: retention %, streak, heatmap 110. Auto-create flashcards from note highlights 111. Learning dashboard: hours/week, items finished, skill radar chart 112. "Currently learning" widget on home 113. Pomodoro sessions linkable to learning items 114. Learning streak tracking 115. Yearly learning report 116. Recommend-next queue (your own backlog ordering)

### F. Habits & Routines (18)
117. Habit CRUD: name, icon, color 118. Schedule: daily / X-per-week / specific weekdays 119. Positive & negative habits (do vs avoid) 120. Quantified habits (drink 8 glasses; count target) 121. Check-in from home screen in one tap 122. Streak counter + best streak 123. Skip with reason (streak-preserving "vacation" mode) 124. Habit heatmap (GitHub-style year view) 125. Completion-rate stats (7/30/90 days) 126. Habit reminders by time of day 127. Morning/evening routine groups (ordered habit chains) 128. Routine "run mode" (step through with timers) 129. Habit ↔ goal linkage 130. Notes on check-ins 131. Habit archive 132. Weekly habit report 133. Grace period setting (day ends at 3am, not midnight) 134. Habit strength score (weighted recent consistency)

### G. Goals & Progress (OKR-style) (16)
135. Goals with horizon: yearly/quarterly/monthly 136. Key results per goal (measurable: number/percent/boolean) 137. Manual + auto-updating KRs (bind KR to: tasks completed in project X, habit completion rate, learning hours) 138. Goal progress roll-up % 139. Goal ↔ projects/habits/learning links 140. Check-in cadence prompts ("update your Q3 goals") 141. Goal timeline visualization 142. Traffic-light status (on-track/at-risk/off-track) 143. Reflection field per check-in 144. Goal archive with outcome notes 145. Vision board note pinned to goals page 146. Yearly themes ("Year of Health") 147. Goal templates 148. Progress snapshots history chart 149. Celebrate animation + log on completion 150. Goals summary in weekly review

### H. Time Tracking & Focus (16)
151. Start/stop timer on any task/learning item 152. Manual time entry + edit 153. Pomodoro mode (25/5 configurable, long breaks) 154. Focus mode full-screen (timer + single task + ambient) 155. Daily timeline of tracked blocks 156. Time by project/label/area reports (charts) 157. Estimates vs actuals report 158. Idle detection prompt (frontend) 159. Weekly time budget per area ("Health ≥ 5h") with progress bars 160. Billable flag + hourly rate (freelancer mode) 161. Time reports export CSV 162. Calendar heat view of deep-work hours 163. Focus streaks (days with ≥1 pomodoro) 164. Distraction log (quick-log interruptions during focus) 165. Auto-suggest time-block plan from today's tasks 166. Month "time balance" review (planned vs spent per area)

### I. Planning, Reviews & Dashboard (16)
167. Home dashboard: today's tasks, habits due, calendar, active timer, streaks, quote 168. Customizable dashboard widgets (show/hide/reorder) 169. Daily planning ritual mode (pick today's 3 MITs) 170. MIT (Most Important Tasks) highlighting 171. Daily shutdown ritual (review done, journal prompt, plan tomorrow) 172. **Weekly review wizard**: went well / didn't / lessons; triage inbox; reschedule overdue; goal check-ins — step-by-step flow 173. Weekly summary auto-report (completed, time, habits, learning) emailed 174. Monthly review with trends 175. Journal with mood tracking (1–5 + emoji) 176. Mood vs productivity correlation chart 177. Year-in-review page (stats wrapped-style) 178. Inbox (capture-first list for triage) 179. Eisenhower matrix view (urgent/important quadrants) 180. "Focus for today" shareable card (image export) 181. Motivational streak notifications 182. Life balance wheel chart (time per area)

### J. Analytics & Gamification (14)
183. Productivity score per day (weighted: tasks, focus, habits) 184. Trends dashboard (velocity, completion rates, overdue ratio) 185. Personal records (most tasks/day, longest streaks) 186. XP & levels from completions 187. Achievements/badges (50+ defined: "7-day streak", "First 100 tasks"...) 188. Charts: burndown per project, cumulative flow 189. Best hours analysis (when do you complete most?) 190. Procrastination report (avg postpones by label/project) 191. Tag cloud of where time goes 192. Compare weeks/months side by side 193. Data-driven suggestions ("Your P1s finish 2× faster before noon") 194. Streak freeze tokens (earned, spendable) 195. Confetti on milestones 196. Public share page for selected stats (optional, off by default)

### K. Automation, AI & Integrations (Phase-later) (12)
197. Rules engine: triggers→actions ("when task overdue 3d → raise priority") 198. Scheduled auto-reports (email) 199. AI (BYOK): natural-language weekly summary 200. AI: break a goal into projects/tasks draft 201. AI: auto-tag & prioritize inbox items 202. AI: flashcard generation from a note 203. AI: chat with your notes (RAG over your own data) 204. Google Calendar 2-way sync 205. Telegram bot (quick capture + daily agenda DM) 206. Email-in capture address 207. iCal feed out (your tasks as a calendar) 208. Zapier-style incoming webhook actions

**Total: 208 cataloged features.** (Reality check, honestly: features 1–182 are ~6 months of consistent solo work; ship modules incrementally and USE the app from week 2 — that's the whole point.)

---

## 4. Tech Stack (backend-first, as you specified)

| Layer | Choice | Notes |
|---|---|---|
| Runtime/API | **Node.js 20 + Express + TypeScript** | REST API; clean layered architecture |
| DB | **MongoDB Atlas free tier + Mongoose** | Schemas below; aggregation pipelines power all analytics |
| Auth | JWT (access 15m + refresh 7d rotation), bcrypt | |
| Validation | Zod (shared schemas package) | Same schemas reused by frontend |
| Jobs | node-cron + Agenda (Mongo-backed job queue) | Reminders, recurring tasks, reports, SRS scheduling |
| Realtime | Socket.io | Live timer sync, reminders, multi-device updates |
| Email | Resend/Nodemailer free tier | Reset, reminders, weekly report |
| Files | Local uploads dev / Cloudflare R2 free tier prod | Avatars, attachments, certificates |
| Docs | OpenAPI (swagger) auto-generated | Contract for the frontend phase |
| Tests | Vitest + Supertest + mongodb-memory-server | Core logic + API tests |
| Frontend (later phases) | **React 18 + Vite + TS**, TanStack Router+Query, Zustand, Tailwind + shadcn/ui, dnd-kit (drag-drop), Recharts, CodeMirror (notes), FullCalendar | Advanced UI: command palette, virtualized lists, optimistic updates, offline cache |
| Hosting | API: Railway/Render free → VPS; Frontend: Vercel/Netlify | $0 |

### MongoDB data model (core collections)
`users, areas, projects, milestones, tasks (embedded subtasks+checklist, indexed on userId+status+dueDate), labels, notes (text index), notebooks, learningItems, skills, decks, cards (SRS fields: ease, interval, dueAt), reviews(card reviews), habits, habitLogs, goals, keyResults, checkIns, timeEntries, journalEntries, savedFilters, achievements, userAchievements, activityLogs, notifications, apiKeys, webhooks, rules, jobsMeta`

Design rules: every doc carries `userId` (multi-user-ready); embed what's read together (subtasks in task), reference what's queried independently (timeEntries); compound indexes for every list view; aggregation pipelines (not app-side loops) for analytics.

---

## 5. Architecture

```
Frontend (React SPA) ──HTTP/REST──► Express API ──► Mongoose ──► MongoDB Atlas
        ▲                              │
        └────────Socket.io◄────────────┤
                                       ├─► Agenda job queue (Mongo): reminders,
                                       │    recurrence spawner, SRS due calc,
                                       │    weekly reports, webhooks out
                                       └─► Email (Resend) / File storage (R2)

API layers: routes → controllers → services (all business logic) → models
Cross-cutting: auth middleware, zod validation middleware, error handler,
rate limiter, activity logger, OpenAPI generator.
```

Backend is built and tested completely first (Phases 1–8 in the prompt pack), verified with Swagger + tests; frontend consumes the finished, documented API (Phases 9–14).

---

## 6. Cost & Timeline

- **Cost:** $0/mo (all free tiers) + optional domain ~$10/yr.
- **Timeline (solo, consistent):** Backend core 6–8 weeks → Frontend core 6–8 weeks → then module-by-module forever (it's your personal app; it grows with you).

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 200-feature scope paralysis | Strict module phases; app is USABLE after Phase 10; features 183+ are "forever backlog" |
| Mongo schema sprawl | Shared Zod schemas as single source of truth; migrations folder with versioned scripts |
| Recurrence/SRS logic bugs | These two get dedicated test suites (most bug-prone logic in the app) |
| Losing motivation | You're the user — dogfood from week 2; each phase ends with something you use daily |
| Free tier limits (512MB Atlas) | Text-heavy data is small; attachments go to R2 not Mongo; TTL indexes on logs |
