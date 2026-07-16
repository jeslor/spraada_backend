# ---- 1. deps: install all dependencies (needed to build) ----
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. builder: generate Prisma client and compile TypeScript ----
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- 3. prod-deps: install production-only dependencies ----
FROM node:24-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# Run prisma generate right before omitting dev-dependencies so npm knows
# to keep the Prisma client engines in the final production node_modules
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
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Ensure permissions are correct for the non-root user
RUN chown -R nestjs:nodejs /app

USER nestjs

# Note: Your Docker run command maps 5000:5000, but your Dockerfile exposes 4444.
# Ensure your NestJS app reads the PORT from environment variables (like process.env.PORT)
# or update your docker run command to match this port!
EXPOSE 4444

CMD ["node", "dist/main"]