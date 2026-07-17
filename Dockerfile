# ---- 1. deps: install all dependencies (needed to build) ----
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. builder: generate Prisma client and compile TypeScript ----
FROM node:24-slim AS builder
WORKDIR /app
# Install openssl so Prisma can detect the OS engine requirements during build
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- 3. prod-deps: install production-only dependencies ----
FROM node:24-slim AS prod-deps
WORKDIR /app
# Install openssl so Prisma can generate the correct engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

# ---- 4. runner: final slim runtime image ----
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Prisma's query engine needs openssl on Debian-based images
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Run as a non-root user
RUN groupadd --gid 1001 nodejs && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nestjs

# Copy clean production dependencies and compiled code
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Note: DO NOT copy .prisma from builder! It is already inside node_modules from prod-deps.

# Ensure permissions are correct for the non-root user
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4444

CMD ["node", "dist/main"]