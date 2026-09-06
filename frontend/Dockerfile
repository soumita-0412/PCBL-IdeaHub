# ============================================================
# IDEAS PORTAL — Frontend Dockerfile (Multi-stage)
# Stage 1: deps     — install dependencies
# Stage 2: development — hot-reload dev server
# Stage 3: builder  — production build
# Stage 4: production — minimal runtime image
# ============================================================

ARG NODE_VERSION=20-alpine

# ─── Stage 1: Dependencies ─────────────────────────────────
FROM node:${NODE_VERSION} AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# ─── Stage 2: Development ──────────────────────────────────
FROM node:${NODE_VERSION} AS development
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "run", "dev"]

# ─── Stage 3: Builder ──────────────────────────────────────
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 4: Production ───────────────────────────────────
FROM node:${NODE_VERSION} AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
