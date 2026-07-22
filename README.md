# FlowForge

Personal productivity super-app (projects, tasks, learning tracker, notes,
habits, goals, time tracking, reviews, analytics). Built backend-first as a
documented REST API (see `CLAUDE.md` for the full spec and phase plan).

## Status

- **Phase 1 — Foundation & auth**: done (this phase).
- Phases 2–8 (backend) and 9–14 (frontend): in progress / not started — see
  `CLAUDE.md` for scope.

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
```

## Test

```bash
pnpm test:api
```

Tests use `mongodb-memory-server` — no running Mongo needed to run the suite.

## Project layout

```
apps/api/            Express + TS REST API
  src/
    config/           env, logger, swagger
    db/               mongoose connection
    middleware/        auth, validate, error handler, rate limit, activity log
    modules/<name>/    routes -> controller -> service -> model, per feature module
    utils/             AppError, response envelope, asyncHandler, email
packages/shared/      Zod schemas shared between API and (future) web frontend
```

## Architecture rules (see CLAUDE.md for full detail)

- Layered: routes → controllers (thin) → services (all business logic) → models.
- Every endpoint: zod-validated, `{ success, data, error }` response envelope,
  documented in Swagger via `@openapi` JSDoc on the route file.
- Every module ships with Supertest happy-path + failure-path tests.
- Multi-user-ready: every document carries `userId`; all queries scope by it.

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
