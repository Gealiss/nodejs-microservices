# ----------
#  Base
# ----------
FROM node:22.14.0-alpine3.21 AS base

WORKDIR /app

# ----------
#  Pruner
# ----------
FROM base AS pruner

# Set working directory
WORKDIR /app

COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace
RUN npx turbo@^2 prune notification-service --docker

# ----------
#  Builder
# ----------
FROM base AS builder

# Set working directory
WORKDIR /app

# Add lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .

# Install dependencies (as they change less often)
RUN npm ci

COPY --from=pruner /app/out/full/ .

# Build the project and its dependencies
RUN npx turbo@^2 build --filter=notification-service...

# Reinstall production dependencies only, removing dev dependencies
RUN npm prune --omit=dev

# ----------
#  Runner
# ----------
FROM node:22.14.0-alpine3.21 AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=builder /app .

CMD ["node", "apps/notification-service/dist/index.js"]