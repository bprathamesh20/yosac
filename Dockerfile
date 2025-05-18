FROM node:18-alpine AS base
# Activate pnpm globally for all stages inheriting from base
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

FROM base AS deps
# Install dependencies required for pnpm and potentially native modules
# corepack is already active from the base stage
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copy package manager files and install dependencies
# This layer is cached when these files don't change
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile # pnpm is available due to base stage setup

FROM base AS builder
WORKDIR /app

# corepack and pnpm are available from the base stage

# Copy installed dependencies and the rest of the application code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN pnpm build # pnpm is available

# --- Runner Stage ---
FROM base AS runner
WORKDIR /app

# corepack and pnpm are available from the base stage for the CMD instruction

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary production artifacts from the builder stage
COPY --from=builder /app/public ./public

# For Next.js 12+ standalone output, the .next directory structure is different.
# This Dockerfile assumes a standard Next.js build output. 
# If using `output: 'standalone'` in next.config.js, this section would need adjustment:
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db

# Set the user for running the application
USER nextjs

EXPOSE 3000

# Set the port environment variable (Next.js default is 3000)
ENV PORT 3000

# Start the Next.js application using pnpm
# This relies on corepack being available in the base image (and prepared in base stage)
# to execute pnpm and your package.json having a "start" script (e.g., "next start")
CMD ["pnpm", "start"] 