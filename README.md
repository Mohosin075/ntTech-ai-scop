# ScopeAI - Software Scoping, Costing & Milestone Engine

Independent Full-Stack Project Assessment Submission.

ScopeAI is an application designed to solve a practical problem software agencies and development teams face: scoping unstructured client project requirements into granular feature modules, calculating risk-adjusted engineering costs, and allocating milestone payment deliverables.

---

## Architecture Overview

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, TypeScript.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM.
- **Database:** PostgreSQL 16 (Dockerized).
- **Testing:** Vitest automated test suite for math formulas and workflow state guards.

---

## Test Accounts

The database seed provides two default accounts:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Estimator** | `estimator@scopeai.dev` | `Estimator123!` | Create scopes, adjust feature hours, submit for review |
| **Admin** | `admin@scopeai.dev` | `Admin123!` | Technical review, approve scopes, reject with required notes |

On the `/login` page, you can use the **Quick Demo Access** buttons to log in directly as either role.

---

## Key Features Implemented

1. **AI & Deterministic Scoping Engine:**
   - Evaluates project descriptions and decomposes them into itemized features categorized by `FRONTEND`, `BACKEND`, `DATABASE`, `INTEGRATION`, and `AI`.
   - Dual-mode architecture: connects to Google Gemini API when configured, with an offline deterministic rule engine fallback for zero downtime.

2. **Mathematical Calculations & State Machine Guards:**
   - Active hours summation: excludes toggled-off features from all financial totals.
   - Dynamic contingency buffer: calculates 5% (Low Risk), 12% (Medium Risk), or 20% (High Risk).
   - Milestone distribution: divides total cost into 30% (Milestone 1), 40% (Milestone 2), and 30% (Milestone 3) with zero-cent rounding drift.
   - 4 business guards: Empty scope guard, Admin role guard, minimum 10-char rejection note guard, and approved immutability lock.

3. **Workspace & Commercial Statement of Work (SOW):**
   - Live feature CRUD with inline editing and stepper adjustments.
   - Visual architecture effort breakdown bar.
   - Client Statement of Work (SOW) modal ready for printing or PDF export.

---

## Local Setup & Execution

### Prerequisites
- Node.js >= 18
- Docker and Docker Compose

### 1. Start PostgreSQL
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker compose up -d
```
The backend example URL targets the Compose database on mapped port `5433`. Set a unique `JWT_SECRET` and add a Gemini or OpenAI API key before a production deployment. Without an AI key, the deterministic rule-based estimator remains available.

### 2. Install Dependencies & Seed Database
```bash
# In backend directory
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
cd ..

# In frontend directory
cd frontend
npm install
cd ..
```

### 3. Run Backend Server
```bash
npm run dev:backend
# Server runs on http://localhost:5000
```

### 4. Run Frontend Client
```bash
npm run dev:frontend
# Client runs on http://localhost:3000
```

---

## Automated Tests

Run the backend unit test suite:

```bash
npm run test:backend
```

The Vitest suite covers deterministic AI fallback scenarios, business logic calculations, rounding accuracy, and workflow guards.

## AI behavior, validation, and limitations

The AI receives the project title and written brief. It returns a 2–3 sentence scope summary, a risk category, a suggested technology stack, a model-reported confidence value, and 6–8 feature estimates with categories, complexity, and hours. The Gemini provider uses Gemini 3.8 Flash; OpenAI is an optional second provider. If neither is configured or a provider response fails validation, ScopeAI uses a deterministic keyword-based estimate so the workflow stays usable offline.

Provider output is checked for the required fields, supported categories and complexity values, a 0–100 confidence range, and feature/hour limits. Automated tests cover sample domain fallback output, cost and contingency math, milestone rounding, empty scopes, role checks, rejection notes, and locked projects. This is structural and rule-level evaluation; the project has not been measured against a labeled dataset or real historical estimates. Confidence is not statistically calibrated, and generated hours, risk, and stack suggestions are planning inputs that a human estimator must review before approval.

## Security notes

- Public registration always creates an `ESTIMATOR`; administrator accounts are provisioned through the seed or other trusted operations.
- Protected API routes require a signed JWT; project ownership and administrator review permissions are enforced server-side.
- Request bodies and route parameters are validated with Zod; new passwords must be at least 8 characters. Production startup rejects a missing, short, or placeholder JWT secret.
- Browser origins must be listed in `CORS_ORIGINS` (development allows local loopback ports). API keys stay in the backend environment.
- Demo credentials and the sample administrator are for local evaluation only; the seed script refuses to run in production.

## Live demo walkthrough

1. Sign in with the estimator demo account. Create a scope from a project brief, inspect the generated feature list and assumptions, adjust a feature, and submit it for review.
2. Sign in with the admin demo account. Open the review queue, review the scope, and either return it with a reason or approve it.
3. Return as the estimator to revise and resubmit a returned scope. Open the analysis page and export the approved scope as an SOW.

For the technical review, be ready to explain the Prisma relationships, Zod validation, role/ownership checks, transactional feature updates, pricing and milestone formulas, AI provider fallback, and the stated estimate limitations.
