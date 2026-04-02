# AI Fitness Coach — AuraFit

## Overview

Full-stack AI-powered fitness coaching app. Users register/login, fill out a health questionnaire (height, weight, age, activity level, goals, injuries, allergies), optionally upload a physique photo, and receive a personalized AI-generated workout + nutrition plan powered by Grok AI (xAI).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database ORM**: Prisma 7 with PG adapter
- **Database**: Neon PostgreSQL (env: `NEON_DATABASE_URL`)
- **AI**: Grok AI (xAI) via `GROK_API_KEY` — model: `grok-2-vision-1212`
- **Auth**: JWT (jsonwebtoken + bcryptjs), token stored in localStorage
- **Validation**: Zod (`zod/v4`), generated from OpenAPI
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite (minimal dark fitness UI)

## Environment Variables Required

- `NEON_DATABASE_URL` — Neon PostgreSQL connection string
- `GROK_API_KEY` — xAI Grok API key
- `SESSION_SECRET` — JWT signing secret

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (backend)
│   │   ├── prisma/         # Prisma schema (User, WorkoutPlan)
│   │   ├── prisma.config.ts # Prisma 7 config (datasource + adapter)
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── auth.ts     # JWT helpers + requireAuth middleware
│   │       │   ├── grok.ts     # Grok AI integration
│   │       │   └── prisma.ts   # Prisma client (PG adapter for Neon)
│   │       └── routes/
│   │           ├── auth.ts     # /api/auth/register, /login, /me
│   │           └── workout.ts  # /api/workout/generate, /plans, /plans/:id
│   └── web/                # React + Vite frontend (minimal UI)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/                 # Drizzle ORM (legacy, not used for main app)
└── scripts/                # Utility scripts
```

## API Endpoints

### Auth (`/api/auth/`)
- `POST /register` — `{ email, password, name? }` → `{ token, user }`
- `POST /login` — `{ email, password }` → `{ token, user }`
- `GET /me` — Bearer token → current user

### Workout (`/api/workout/`) — all require Bearer token
- `POST /generate` — `{ userProfile: { height, weight, age, activityLevel, goals, injuries?, allergies? }, photoBase64? }` → generated workout plan (saved to DB)
- `GET /plans` — list all plans for the user
- `GET /plans/:id` — get specific plan

## Database Schema (Prisma / Neon)

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  password     String        # bcrypt hashed
  name         String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  workoutPlans WorkoutPlan[] # One-to-many
}

model WorkoutPlan {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(...)
  plan        Json     # AI-generated plan JSON
  userProfile Json     # snapshot of user's profile at generation time
  createdAt   DateTime @default(now())
}
```

## Prisma Commands

Run from `artifacts/api-server/`:

```bash
npx prisma generate --config ./prisma.config.ts   # Regenerate client
npx prisma db push --config ./prisma.config.ts     # Push schema changes to Neon
```

## Codegen

```bash
pnpm --filter @workspace/api-spec run codegen
```
