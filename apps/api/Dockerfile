# Built from the monorepo root (needs the pnpm workspace + packages/shared).
# Runs the API through tsx (same as `pnpm dev:api`) rather than a tsc build —
# this repo keeps @flowforge/shared as raw TS resolved at runtime, and a
# separate `node dist/index.js` step would not be able to import it.
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Copy just the manifests first so `pnpm install` is cached across rebuilds
# unless a dependency actually changes.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
