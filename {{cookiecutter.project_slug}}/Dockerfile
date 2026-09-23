FROM node:{{ cookiecutter.node_version }}-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Frozen install: fails if package-lock.json is missing or out of sync with package.json.
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]

FROM base AS ops
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY tsconfig.json ./
COPY scripts ./scripts
COPY lib ./lib
CMD ["node", "-e", "console.log('ops image ready')"]

FROM base AS migrator
WORKDIR /app
# Same locked versions as the app (drizzle-kit is a devDependency, hence --include=dev).
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/lib/db ./lib/db
COPY scripts/migrate.sh ./scripts/
CMD ["sh", "scripts/migrate.sh"]
