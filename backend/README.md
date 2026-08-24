# OCP e-Guide Backend

REST API backend for the OCP e-Guide platform built with Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.IO, and JWT authentication.

## Requirements

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/ocp_eguide` |
| `JWT_SECRET` | JWT signing secret | required |
| `JWT_REFRESH_SECRET` | Refresh token secret | required |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Next.js frontend URL | `http://localhost:3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `OAUTH_CLIENT_ID` | Google OAuth client ID | optional |
| `OAUTH_CLIENT_SECRET` | Google OAuth client secret | optional |

## Database Setup

### PostgreSQL

Create the database:

```sql
CREATE DATABASE ocp_eguide;
```

### Prisma Migrate

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Seed Database

```bash
npm run db:seed
```

### Reset Database

```bash
npm run db:reset
```

## Development

```bash
npm run dev
```

Server starts at `http://localhost:5000`.

## Production

```bash
npm run build
npm start
```

## API Documentation

Swagger UI available at:

```
http://localhost:5000/api/docs
```

JSON specification:

```
http://localhost:5000/api/docs/json
```

## API Structure

All endpoints are prefixed with `/api`:

| Path | Description |
|------|-------------|
| `/api/auth/*` | Authentication (register, login, logout, refresh, me) |
| `/api/users/*` | User management, employee list, status updates |
| `/api/internships/*` | Internship CRUD and progress tracking |
| `/api/tasks/*` | Task management |
| `/api/requests/*` | Request management (document, access, meeting, etc.) |
| `/api/notifications/*` | Notification management |
| `/api/locations/*` | OCP locations (buildings, departments, facilities) |
| `/api/qr/*` | QR code generation and scanning |
| `/api/health` | Health check endpoint |

## Authentication Flow

1. **Register**: `POST /api/auth/register` with user details
2. **Login**: `POST /api/auth/login` with email + password
3. **Use Token**: Include `Authorization: Bearer <accessToken>` header
4. **Refresh**: `POST /api/auth/refresh` with expired access token + valid refresh token
5. **Logout**: `POST /api/auth/logout` (invalidates refresh tokens)

## Socket.IO

Connect to `ws://localhost:5000` with authentication:

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "<JWT_ACCESS_TOKEN>" }
});
```

### Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:status_changed` | Server→Client | User status changed (ONLINE/BUSY/OFFLINE) |
| `notification:new` | Server→Client | New notification received |
| `notification:read` | Server→Client | Notification marked as read |
| `request:updated` | Server→Client | Request status changed |
| `task:updated` | Server→Client | Task status changed |
| `update_status` | Client→Server | Update own status |

### Rooms

| Room | Description |
|------|-------------|
| `user:{userId}` | Per-user room for targeted events |

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@ocp.ma | Password123! | ADMIN |
| m.alaoui@ocp.ma | Password123! | EMPLOYEE (HR) |
| k.idrissi@ocp.ma | Password123! | EMPLOYEE (IT) |
| f.bennani@ocp.ma | Password123! | EMPLOYEE (Security) |
| s.tazi@ocp.ma | Password123! | EMPLOYEE (Reception) |
| o.fassi@ocp.ma | Password123! | EMPLOYEE (Engineering) |
| y.amrani@ocp.ma | Password123! | INTERN |
| s.chakir@ocp.ma | Password123! | INTERN |
| r.mouline@ocp.ma | Password123! | INTERN |

## Testing

```bash
# Run tests (requires server running)
npm test

# Run with coverage
npm run test:coverage
```

## OAuth2 Integration

The backend is prepared for OAuth2 (Google) integration. Set these environment variables:

```
OAUTH_CLIENT_ID=your-google-client-id
OAUTH_CLIENT_SECRET=your-google-client-secret
OAUTH_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

The `User.provider` field tracks authentication origin (`local`, `google`, etc.).

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (DB, JWT, Swagger)
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, validation, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.IO setup
│   ├── types/           # TypeScript types
│   ├── validators/      # Zod schemas
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed
├── tests/               # Integration tests
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md
```
