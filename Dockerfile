# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install system dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable Corepack for Yarn
RUN corepack enable

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Enable Corepack for Yarn
RUN corepack enable

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./

# Copy application source
COPY . .

# Stage 3: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install postgresql-client for database operations and bash for scripts
RUN apk add --no-cache postgresql-client bash

# Enable Corepack for Yarn
RUN corepack enable

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tailwind.config.ts ./
COPY --from=builder /app/middleware.ts ./
COPY --from=builder /app/components.json ./

# Copy source directories
COPY --from=builder /app/app ./app
COPY --from=builder /app/components ./components
COPY --from=builder /app/constant ./constant
COPY --from=builder /app/context ./context
COPY --from=builder /app/db ./db
COPY --from=builder /app/hooks ./hooks
COPY --from=builder /app/i18n ./i18n
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/public ./public
COPY --from=builder /app/types ./types

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Combined entrypoint with all logic
CMD ["/bin/sh", "-c", "\
  echo 'Waiting for postgres...' && \
  until PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d $POSTGRES_DB -c '\\q' 2>/dev/null; do \
    echo 'Postgres is unavailable - sleeping'; \
    sleep 1; \
  done && \
  echo 'Postgres is ready' && \
  echo 'Running database migrations...' && \
  yarn db:push && \
  echo 'Building application...' && \
  yarn build && \
  echo 'Starting application...' && \
  exec yarn start \
"]
