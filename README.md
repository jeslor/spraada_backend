# Spraada Backend API

NestJS 11 REST API and WebSocket server for Spraada — a peer-to-peer tool rental marketplace. Handles authentication, tool listings, bookings, real-time messaging, notifications, media uploads, and email.

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| Database | PostgreSQL 13 (Docker) / Supabase (production) |
| ORM | Prisma 6 with PgBouncer connection pooling |
| Cache | Redis 7 (via `@nestjs/cache-manager` + `cache-manager-redis-yet`) |
| Auth | Passport-JWT (access + refresh tokens), Google OAuth 2.0 |
| Password hashing | Argon2 |
| Real-time | Socket.IO (`@nestjs/websockets`) |
| Media storage | AWS S3 |
| Email | Nodemailer |
| Validation | `class-validator` + `class-transformer` |
| Containerisation | Docker Compose |

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **Docker Desktop** — runs PostgreSQL and Redis locally
- **npm** ≥ 9

---

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env` in the project root. Every variable listed below is required unless marked optional.

```env
# ── Database ─────────────────────────────────────────────────────────────────
# Local Docker instance (used during development)
DATABASE_URL="postgresql://spraada_dev:spraada_dev_password@localhost:5435/spraada_dev_db?schema=public"

# Production: use the pooler URL for runtime, and the direct URL for migrations
# DATABASE_URL="postgresql://<user>:<password>@<pooler-host>:6543/postgres?pgbouncer=true"
# DIRECT_URL="postgresql://<user>:<password>@<direct-host>:5432/postgres"

# ── Application ──────────────────────────────────────────────────────────────
PORT=4444                         # HTTP server port (default: 4444)
FRONTEND_URL=http://localhost:3000 # Used for CORS and outbound email links

# ── JWT ──────────────────────────────────────────────────────────────────────
JWT_SECRET=<random-256-bit-hex>
JWT_EXPIRES_IN=600s               # Access token TTL

JWT_REFRESH_TOKEN=<random-256-bit-hex>
JWT_REFRESH_EXPIRES_IN=7d         # Refresh token TTL

# ── Google OAuth 2.0 ─────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:4444/auth/google/callback

# ── AWS S3 (media storage) ───────────────────────────────────────────────────
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_S3_BUCKET_REGION=eu-north-1
AWS_S3_BUCKET_NAME=<your-bucket-name>

# ── Email (SMTP) ──────────────────────────────────────────────────────────────
EMAIL_HOST=<smtp-host>
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=<smtp-username>
EMAIL_PASSWORD=<smtp-password>
EMAIL_FROM="Spraada <no-reply@yourdomain.com>"

# ── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379   # Omit to fall back to in-memory cache
```

> **Secret generation** — use `openssl rand -hex 32` to generate each secret value.

### 3. Start infrastructure

```bash
# Bring up PostgreSQL (port 5435) and Redis (port 6379)
npm run db:dev:up
```

### 4. Apply database migrations

```bash
npx prisma migrate dev
```

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Start the development server

```bash
npm run start:dev
```

The API is now listening on **http://localhost:4444**.

---

## Production Deployment

```bash
npm run build
npm run start:prod
```

Set `DATABASE_URL` to the PgBouncer pooler connection string and `DIRECT_URL` to the direct connection string. Prisma uses `directUrl` for migration commands and `url` for all runtime queries.

---

## NPM Scripts

| Script | Description |
|---|---|
| `npm run start:dev` | Start with hot-reload (watch mode) |
| `npm run start:debug` | Start with Node.js debugger attached |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled production build |
| `npm run db:dev:up` | Start PostgreSQL + Redis containers |
| `npm run db:dev:rm` | Stop and remove the DB container with its volume |
| `npm run db:dev:restart` | Full cycle: remove → start → deploy migrations |
| `npm run prisma:dev:deploy` | Run `prisma migrate deploy` (apply pending migrations) |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier over `src/` and `test/` |
| `npm run test` | Jest unit tests |
| `npm run test:e2e` | Jest end-to-end tests |
| `npm run test:cov` | Jest with coverage report |

---

## API Reference

> All protected endpoints require an `Authorization: Bearer <access_token>` header.

### Authentication — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/sign-up` | — | Register a new user |
| `POST` | `/auth/sign-in` | — | Sign in, returns access + refresh tokens |
| `POST` | `/auth/refresh-tokens` | — | Exchange a refresh token for a new pair |
| `POST` | `/auth/sign-out` | ✓ JWT | Invalidate refresh token |
| `POST` | `/auth/check-email` | — | Check whether an email is already registered |
| `POST` | `/auth/reset-password-request` | — | Send password-reset email |
| `POST` | `/auth/check-reset-token-exists` | — | Validate reset token presence |
| `POST` | `/auth/check-reset-token-expired` | — | Validate reset token expiry |
| `POST` | `/auth/save-new-password` | — | Persist the new password after reset |
| `GET` | `/auth/google/login` | — | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | — | Google OAuth callback |
| `GET` | `/auth/:id` | — | Fetch user record by ID |

### Profiles — `/profile`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/profile` | ✓ JWT | Create profile (called after first sign-up) |
| `GET` | `/profile/:id` | ✓ Role | Get a profile by ID |
| `PATCH` | `/profile/:id` | ✓ Owner | Update profile fields |
| `PATCH` | `/profile/:id/favorite-tools` | ✓ JWT | Add / remove a tool from favourites |

### Tools — `/tools`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/tools` | ✓ JWT | Create a tool listing |
| `GET` | `/tools` | — | List all tools |
| `GET` | `/tools/random` | — | Fetch a random set of tools (cached 30 s) |
| `GET` | `/tools/search` | — | Search with filters: `searchTerm`, `category`, `sortBy`, `availability`, `page`, `limit` (cached 10 s) |
| `GET` | `/tools/owner/:ownerId` | — | All tools belonging to a profile |
| `GET` | `/tools/:id` | — | Single tool detail |
| `PATCH` | `/tools/:id` | ✓ Owner | Update tool listing |
| `PATCH` | `/tools/:id/availability` | ✓ Owner | Toggle available flag |
| `DELETE` | `/tools/:id` | ✓ Owner | Delete listing and remove S3 images |

### Bookings — `/bookings`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/bookings` | ✓ JWT | Create a booking request |
| `GET` | `/bookings` | ✓ JWT | All bookings (admin use) |
| `GET` | `/bookings/:id` | ✓ JWT | Single booking |
| `GET` | `/bookings/profile/:profileId` | ✓ JWT | All bookings for a profile |
| `GET` | `/bookings/tool/:toolId` | ✓ JWT | All bookings for a tool |
| `GET` | `/bookings/rented/profile/:profileId` | ✓ JWT | Bookings where profile is the owner |
| `GET` | `/bookings/borrowed/profile/:profileId` | ✓ JWT | Bookings where profile is the borrower |
| `PATCH` | `/bookings/:id` | ✓ JWT | Update booking status |
| `PATCH` | `/bookings/:id/delete` | ✓ JWT | Soft-delete a booking for the requesting party |

### Conversations — `/conversation`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/conversation/:profileId` | ✓ JWT | All conversations for a profile |
| `GET` | `/conversation/:profileId/unread-first` | ✓ JWT | Same, sorted with unread conversations first |
| `PATCH` | `/conversation/:conversationId/mark-as-read` | ✓ JWT | Mark all messages in a conversation as read |

### Messages — `/message`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/message` | ✓ JWT | Send a message |
| `POST` | `/message/delete` | ✓ JWT | Soft-delete a message |
| `POST` | `/message/more/:conversationId` | ✓ JWT | Paginate older messages (cursor-based) |
| `POST` | `/message/new/:conversationId` | ✓ JWT | Fetch messages newer than a given ID |

### Notifications — `/notification`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/notification` | ✓ JWT | Create a notification |
| `POST` | `/notification/updateNotifications` | ✓ JWT | Bulk-update notifications |
| `GET` | `/notification/profile/:id` | ✓ JWT | All notifications for a profile |
| `GET` | `/notification/profile/:id/counter` | ✓ JWT | Unread notification count |
| `PATCH` | `/notification/:id` | ✓ JWT | Mark a notification read |
| `DELETE` | `/notification/:id` | ✓ JWT | Delete a notification |

### Media — `/resources`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/resources/upload/:userId` | ✓ JWT | Upload files to S3 (multipart/form-data) |
| `POST` | `/resources/delete/:userId` | ✓ JWT | Remove files from S3 by key |

---

## WebSocket Events

The server exposes a Socket.IO namespace for real-time features. All events require a valid JWT passed as the `auth.token` on socket handshake.

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `joinConversation` | `{ conversationId }` | Subscribe to a conversation room |
| Client → Server | `sendMessage` | message payload | Broadcast a new message |
| Server → Client | `newMessage` | message object | Deliver incoming message to room |
| Server → Client | `notification` | notification object | Push a new notification |

---

## Database Schema

```
User
  id · email · hash (Argon2) · hashedRefreshToken · hashedResetPasswordToken
  isOnboarded · role (USER | ADMIN | RENTER)
  → Profile (1-to-1)

Profile
  id · firstName · lastName · email · bio · avatarUrl · coverUrl
  country · city · address · phone · userId
  → myToolBox (Tool[]) · borrowedTools (Booking[]) · rentedTools (Booking[])
  → conversations · sentMessages · notifications · favoriteTools

Tool
  id (cuid) · name · description · category · dailyPriceCents · depositCents
  replacementValue · available · toolPhotos (JSON) · profileId
  Indexes: profileId · category · available · createdAt

Booking
  id (cuid) · toolId · borrowedById · rentedById · pickUpDate · returnDate
  totalPrice · status (PENDING | CONFIRMED | CANCELLED | COMPLETED)
  deletedByBorrower · deletedByOwner
  Indexes: toolId · borrowedById · rentedById · status · (pickUpDate, returnDate)

Conversation
  id · participantOneId · participantTwoId · unReadMessagesCounters (JSON)
  Unique: (participantOneId, participantTwoId)

Message
  id (cuid) · senderId · content · mediaFiles (JSON) · conversationId
  deletedBySender · deletedByReceiver
  Indexes: conversationId · senderId · (conversationId, createdAt)

Notification
  id · profileId · title · content · link · isRead · profileMediaFiles (JSON)
  Indexes: profileId · (profileId, isRead) · createdAt

UnreadMessagesCounter  — per-profile JSON counter map
NotificationsCounter   — per-profile integer counter
```

---

## Docker

The `docker-compose.yml` defines two services:

| Service | Image | Host Port | Purpose |
|---|---|---|---|
| `dev-db` | `postgres:13` | `5435` | Primary database |
| `dev-redis` | `redis:7-alpine` | `6379` | Cache (persists with `--save 60 1`) |

```bash
# Start both services
npm run db:dev:up

# View database logs
docker compose logs dev-db

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Hard-reset database (development only — destroys all data)
npm run db:dev:rm && npm run db:dev:up && npx prisma migrate dev
```

---

## Project Structure

```
src/
├── Auth/               # JWT + Google OAuth, password reset
│   ├── decorator/      # @GetUser() param decorator
│   ├── dto/            # SignInDto, SignUpDto, etc.
│   ├── guard/          # JwtAuthGuard, GoogleAuthGuard
│   └── strategy/       # JwtStrategy, GoogleStrategy
├── Profile/            # Profile CRUD, favourite tools
│   └── Guard/          # ProfileOwnerGuard
├── tools/              # Tool listings, availability, search
│   ├── dto/
│   └── Guard/          # ToolOwnerGuard
├── booking/            # Rental lifecycle management
├── conversation/       # Conversation retrieval and read-state
├── message/            # Message send, delete, pagination
├── notification/       # Notification CRUD and counters
├── events/             # Socket.IO gateway (real-time)
├── uploadResource/     # AWS S3 upload / delete
├── email/              # Nodemailer transactional email
├── home/               # Health-check / root endpoint
├── prisma/             # PrismaService singleton
└── main.ts             # Bootstrap, CORS, cookie-parser
```

---

## Troubleshooting

### Database won't connect

1. Confirm Docker Desktop is running.
2. Verify port `5435` is not bound by another process: `lsof -i :5435`.
3. Confirm `DATABASE_URL` in `.env` matches the Docker Compose credentials.
4. Run `npm run db:dev:restart` to perform a clean restart with migrations applied.

### Prisma migration errors

```bash
# Re-generate the client after schema changes
npx prisma generate

# Inspect current migration state
npx prisma migrate status

# Reset all migrations (development only — destroys data)
npx prisma migrate reset
```

### Redis connection errors

The cache module falls back to in-memory if `REDIS_URL` is not set. Ensure `dev-redis` is running (`npm run db:dev:up`) and `REDIS_URL=redis://localhost:6379` is present in `.env`.

### JWT errors

- Confirm `JWT_SECRET` and `JWT_REFRESH_TOKEN` are set and non-empty.
- Access tokens expire after `JWT_EXPIRES_IN` (default `600s`). The frontend must call `POST /auth/refresh-tokens` to obtain a new pair before expiry.
- The `Authorization` header must be `Bearer <token>` with a single space.

