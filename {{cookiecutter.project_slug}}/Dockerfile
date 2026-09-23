FROM node:{{ cookiecutter.node_version }}-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
# The template ships no lockfile, so a freshly generated project has none until
# `npm install` runs. Prefer `npm ci` when a lock exists (reproducible), and fall
# back to `npm install` when it does not. Commit the lockfile from your project.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
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
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi
COPY tsconfig.json ./
COPY scripts ./scripts
COPY lib ./lib
CMD ["node", "-e", "console.log('ops image ready')"]

FROM base AS migrator
WORKDIR /app
RUN npm install drizzle-kit@0.30 drizzle-orm@0.38 pg@8
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/lib/db ./lib/db
COPY scripts/migrate.sh ./scripts/
CMD ["sh", "scripts/migrate.sh"]
