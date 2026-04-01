# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=api

FROM node:22-bookworm-slim AS runner
RUN apt-get update \
  && apt-get install -y --no-install-recommends wget ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 appuser \
  && useradd --system --uid 1001 --gid appuser appuser

WORKDIR /repo
ENV NODE_ENV=production
COPY --from=builder --chown=appuser:appuser /repo /repo

USER appuser
WORKDIR /repo/apps/api
EXPOSE 3001
ENV API_PORT=3001
ENV API_HOST=0.0.0.0
CMD ["node", "dist/index.js"]
