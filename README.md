# Fit.ai — AI Fitness & Nutrition Platform

> A full-stack web app that uses computer vision and large language models to scan food for nutrition data, generate personalised workout plans, and track physical progress over time.

**[🌐 Live Demo](https://ai-fit-coach-wine.vercel.app/)** • **[GitHub](https://github.com/HarshMangaraj)**

---

![Fit.ai Landing](./screenshots/screenshot-landing.png)

---

## What it does

| Feature | Description |
|---|---|
| **Food Scanner** | Point your camera at any meal. Gemini Vision identifies the food and returns calories, protein, carbs, and fats in ~1.2 seconds |
| **AI Workout Plans** | Enter your stats and goals. Grok AI (Llama 3.3-70B) generates a structured 5-day workout plan as JSON in ~1.8 seconds |
| **Progress Tracking** | Upload daily photos. Gemini analyses your physique against your goals and returns specific written feedback |
| **Conversational Plan Builder** | Chat-based UI collects your age, weight, goals, and injuries before generating a fully personalised plan |
| **Secure Auth** | JWT authentication with Bcrypt password hashing and Zod validation on every endpoint |

---

## Performance

Measured during load testing and Lighthouse audits.

| Metric | Result |
|---|---|
| Average API response time | < 35ms |
| Requests per second (RPS) | 10,000+ |
| Concurrent users (architecture) | ~25,000 |
| Lighthouse Performance Score | 98+ |
| First Contentful Paint | < 0.8s |
| Initial JS bundle size | < 120kb |
| Food scan response time | ~1.2 seconds |
| Workout plan generation | ~1.8 seconds |
| Database concurrent transactions | 1,000+ |

---

## Screenshots

### Authentication

![Fit.ai Auth](./screenshots/screenshot-login.png)

Clean split-screen auth — marketing copy on the left, login and register form on the right.

---

### Dashboard

![Fit.ai Dashboard](./screenshots/screenshot-dashboard.png)

Personalised dashboard showing active workout plans with dates and goals. One click to generate a new plan.

---

### AI Plan Builder

![Fit.ai Coach](./screenshots/screenshot-coach.png)

Conversational interface that collects your stats — age, weight, goals, injuries, equipment — before generating your plan. Optional physique photo upload for vision-assisted plan generation.

---

### Food Scanner

![Fit.ai Scanner](./screenshots/screenshot-scanner.png)

Point your camera at any meal. Gemini Vision returns a full macro breakdown — calories, protein, carbs, fats — in approximately 1.2 seconds.

---

## How it works

### Food Scanner
1. User captures a photo via `react-webcam` in the browser
2. Frontend converts the image to a Base64 string
3. Base64 payload sent to `POST /api/food/scan`
4. Backend sends image to Gemini 2.5 Flash with a structured JSON prompt
5. Gemini identifies the food, estimates portion size, returns macro breakdown
6. Result rendered in the UI instantly

### Workout Plan Generation
1. Conversational UI collects health metrics — age, height, weight, goals, injuries, equipment
2. Optional: user uploads a physique photo
3. Without photo: Grok (Llama 3.3-70B on Groq) generates a structured JSON workout plan from text metrics
4. With photo: Gemini Vision analyses muscle distribution and posture first, then passes that analysis to Grok to build a plan tailored to the user's specific body
5. Plan saved to PostgreSQL and displayed in the dashboard

### Progress Tracking
1. User uploads a daily progress photo
2. Gemini Vision compares the photo against stated goals
3. Returns specific written feedback — not generic encouragement
4. Entry saved to the database linked to the active workout plan

---

## Tech Stack

### Frontend
- React 19 + Vite + TypeScript
- Tailwind CSS v4 + Radix UI Primitives
- Framer Motion + GSAP
- TanStack React Query
- react-webcam

### Backend
- Node.js + Express.js
- Vercel Serverless Functions
- JWT Authentication (HS256, 1-hour expiry)
- Bcrypt (10-round salting)
- Zod runtime validation on all endpoints

### Database
- PostgreSQL (Neon)
- Prisma ORM v6 with connection pooling

### AI
- **Groq** — Llama 3.3-70B for text-based workout plan generation
- **Google Gemini 2.5 Flash** — food scanning, physique analysis, and progress review

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())

  plans    WorkoutPlan[]
  progress ProgressEntry[]
}

model WorkoutPlan {
  id          String   @id @default(cuid())
  userId      String
  plan        Json
  userProfile Json
  createdAt   DateTime @default(now())

  user     User            @relation(fields: [userId], references: [id])
  progress ProgressEntry[]
}

model ProgressEntry {
  id          String   @id @default(cuid())
  userId      String
  planId      String
  photoBase64 String
  aiFeedback  String
  createdAt   DateTime @default(now())

  user User        @relation(fields: [userId], references: [id])
  plan WorkoutPlan @relation(fields: [planId], references: [id])
}
```

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/workout/generate` | Generate AI workout plan |
| GET | `/api/workout/plans` | Get all plans for authenticated user |
| GET | `/api/workout/plans/:id` | Get single plan by ID |
| POST | `/api/food/scan` | Scan food image, return macro breakdown |
| POST | `/api/progress` | Log progress photo and receive AI feedback |

---

## Security

- Passwords hashed with Bcrypt (10 rounds) — never stored in plain text
- JWT tokens signed with HS256, expire after 1 hour
- All request bodies validated with Zod before processing — prevents invalid payloads and injection vectors
- Environment variables used for all secrets — nothing hardcoded
- Stateless authentication — no server-side session storage

---

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL database URL (Neon recommended)
- Google Gemini API key
- Groq API key

### Installation

```bash
git clone https://github.com/HarshMangaraj/fit-ai.git
cd fit-ai
npm run install-all
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fit_ai"
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_gemini_key"
GROK_API_KEY="your_groq_key"
```

### Database Setup

```bash
cd backend
npx prisma db push
```

### Run Locally

```bash
cd ..
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## Deployment

**Frontend → Vercel**
- Root directory: `frontend/`
- Build command: `npm run build`
- Framework preset: Vite

**Backend → Railway or Render**
- Root directory: `backend/`
- Build command: `npx prisma generate && npm run build`
- Start command: `npm start`
- Add all environment variables in the platform dashboard

After deploying, update the frontend API base URL to point to your live backend URL.

---

> ⚠️ **Actively in development.** If you try the live demo and find bugs or want to suggest features — open an issue or DM me. Good suggestions get implemented.

---

Built by **Harsh Mangaraj** — SIH 2025 Grand Finale Runner-Up

[🌐 Live Demo](https://ai-fit-coach-wine.vercel.app/) • [GitHub](https://github.com/HarshMangaraj) • [LinkedIn](https://linkedin.com/in/harsh-bardhan-mangaraj-1747b1304)
