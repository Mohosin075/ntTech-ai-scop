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
docker compose up -d
```
The database runs on mapped port `5433` to prevent conflicts with local PostgreSQL instances.

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

All 12 unit tests covering business logic calculations, rounding accuracy, and workflow guards run via Vitest.
