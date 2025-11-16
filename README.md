# Spraada Backend API

A NestJS-based REST API for the Spraada platform - a peer-to-peer tool rental marketplace where users can rent and lend tools to their community.

## 🚀 Features

- **Tool Rental Management** - Complete CRUD operations for tool listings
- **Booking System** - Handle tool rental requests and scheduling
- **Authentication & Authorization** - JWT-based auth with user onboarding flow
- **User Management** - User profiles with complete onboarding system
- **Geolocation Support** - Location-based tool discovery
- **Photo Management** - Image upload and storage for tool listings
- **Database Integration** - PostgreSQL with Prisma ORM
- **Validation** - Request validation using class-validator
- **Containerization** - Docker support for development
- **Type Safety** - Full TypeScript implementation

## 🛠 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Password Hashing**: Argon2
- **Validation**: class-validator & class-transformer
- **Containerization**: Docker & Docker Compose
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- npm or yarn

## 🏗 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd spraada_backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://spraada_dev:spraada_dev_password@localhost:5435/spraada_dev_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Start the database**

   ```bash
   npm run db:dev:up
   ```

5. **Run database migrations**

   ```bash
   npm run prisma:dev:migrate
   ```

6. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

## 🚦 Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

### Database Management

```bash
# Restart database with fresh migrations
npm run db:dev:restart

# Reset database (⚠️ Development only)
npm run prisma:dev:reset

# View database in Prisma Studio
npx prisma studio
```

## 📚 API Endpoints

### Authentication

- `POST /auth/signin` - User sign in
- `POST /auth/signup` - User registration

### User Management

- `GET /dashboard/user` - Get current user profile (Protected)
- `PUT /user/profile` - Update user profile (Protected)
- `POST /user/complete-onboarding` - Mark user as onboarded (Protected)

### Tool Management (Planned)

- `GET /tools` - Browse available tools with filters
- `POST /tools` - Create new tool listing (Protected)
- `GET /tools/:id` - Get specific tool details
- `PUT /tools/:id` - Update tool listing (Protected, Owner only)
- `DELETE /tools/:id` - Delete tool listing (Protected, Owner only)

### Booking Management (Planned)

- `POST /bookings` - Create rental booking (Protected)
- `GET /bookings` - Get user's bookings (Protected)
- `GET /bookings/:id` - Get specific booking details (Protected)
- `PUT /bookings/:id/status` - Update booking status (Protected)

### Response Format

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isOnboarded": false,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isOnboarded": false
  }
}
```

## 🗄 Database Schema

### User Model

- `id` - Auto-increment primary key
- `email` - Unique user email
- `hash` - Hashed password (Argon2)
- `isOnboarded` - Onboarding completion status
- `profile` - One-to-one relation with Profile

### Profile Model

- Complete user profile information
- Links to User model
- Supports tool listings and bookings
- Includes location data (country, city)
- User role and contact information

### Listing Model (Tools)

- `id` - Unique tool listing identifier
- `title` - Tool name/title
- `description` - Detailed tool description
- `dailyPriceCents` - Daily rental price in cents
- `depositCents` - Security deposit amount
- `replacementValue` - Tool replacement value
- `lat/lng` - Geolocation coordinates
- `address/city/country` - Location information
- `photos` - Related tool images
- Links to Profile (owner)

### Booking Model

- `id` - Unique booking identifier
- `start/end` - Rental period dates
- `totalCents` - Total rental cost
- `status` - Booking status (pending, confirmed, completed, etc.)
- Links to Profile (renter) and Listing

### Photo Model

- `id` - Unique photo identifier
- `photoKey` - Storage key for image
- `url` - Image URL
- Links to Listing

## 🔒 Authentication Flow

1. User registers/signs in
2. JWT token generated with user payload
3. `isOnboarded` flag determines redirect flow:
   - `false` → Redirect to onboarding
   - `true` → Redirect to dashboard
4. Protected routes require valid JWT token

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Available Scripts

| Script                    | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run start:dev`       | Start development server with hot reload |
| `npm run build`           | Build for production                     |
| `npm run start:prod`      | Start production server                  |
| `npm run db:dev:up`       | Start PostgreSQL container               |
| `npm run db:dev:restart`  | Restart DB with migrations               |
| `npm run prisma:generate` | Generate Prisma client                   |
| `npm run lint`            | Run ESLint                               |
| `npm run format`          | Format code with Prettier                |

## 🐳 Docker Commands

```bash
# Start database only
docker-compose up dev-db -d

# Stop and remove database
docker-compose down

# View logs
docker-compose logs dev-db
```

## 🔧 Development

### Project Structure

```
src/
├── Auth/           # Authentication module
│   ├── decorator/  # Custom decorators
│   ├── dto/        # Data transfer objects
│   ├── guard/      # Auth guards
│   └── strategy/   # JWT strategy
├── User/           # User management
├── Tools/          # Tool listing management (planned)
├── Bookings/       # Rental booking system (planned)
├── prisma/         # Database service
└── main.ts         # Application entry point
```

### Adding New Modules

```bash
nest generate module <module-name>
nest generate controller <controller-name>
nest generate service <service-name>
```

## 🚨 Troubleshooting

### Database Connection Issues

1. Ensure Docker is running
2. Check if port 5435 is available
3. Verify `.env` DATABASE_URL format
4. Restart database: `npm run db:dev:restart`

### Prisma Issues

```bash
# Reset Prisma client
npx prisma generate

# Reset database (development)
npx prisma migrate reset
```

### JWT Issues

- Verify JWT_SECRET is set in `.env`
- Check token format in Authorization header: `Bearer <token>`
- Ensure user exists and is not deleted

## 📝 Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm run test`
4. Lint code: `npm run lint`
5. Submit pull request

## 📄 License

[Add your license information here]
