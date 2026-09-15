# Built from the monorepo root (needs the pnpm workspace + packages/shared).
FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/web apps/web

WORKDIR /app/apps/web
# `vite build` directly (skips the `tsc -b` prestep in the `build` script) —
# esbuild transforms only, same verification level used throughout dev.
RUN pnpm exec vite build

FROM nginx:1.27-alpine
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
