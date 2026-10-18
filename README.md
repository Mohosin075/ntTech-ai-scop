# ⚡ ScopeAI — Intelligent Software Scoping, Costing & Milestone Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-green?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-12_Passed-brightgreen?logo=vitest)](https://vitest.dev/)

An enterprise-grade, modular full-stack application that transforms raw software project ideas into structured feature breakdowns, dynamic risk-adjusted cost quotes, and rounding-safe payment milestones.

---

## 🔑 Demo Credentials (1-Click Login Enabled)

| Role | Email | Password | Permissions & Purpose |
| :--- | :--- | :--- | :--- |
| **Lead Estimator** | `estimator@scopeai.dev` | `Estimator123!` | Create AI scopes, adjust feature hours, submit for review |
| **Admin Reviewer** | `admin@scopeai.dev` | `Admin123!` | Technical review, Approve scopes, Reject with mandatory feedback |

> ⚡ **Tip:** On the `/login` page, you can simply click **`[As Estimator]`** or **`[As Admin]`** under **Quick Demo Access** to log in instantly without typing.

---

## 🛠 Tech Stack & Architecture

### **Frontend (`/frontend`)**
- **Framework:** Next.js 16 (App Router with Turbopack) & React 19
- **Styling:** Tailwind CSS + Lucide Icons
- **Design System:** Modern Dark Slate (`#090D16`) + Electric Indigo (`#6366F1`) + Plus Jakarta Sans & JetBrains Mono typography
- **State & Auth:** React Context + JWT Bearer Token Session Management + Non-blocking Toast notification system
- **Enterprise Capabilities:**
  - **Phased AI Synthesis Dialog:** 4-step progressive state visualization during scope generation.
  - **Executive Analytics Bar:** Global pipeline value, total engineering hours, pending review gates, and average quote metrics.
  - **Visual Architecture Effort & Cost Distribution:** Multi-segment stacked progress chart breakdown by category (Frontend, Backend, Database, Integration, AI).
  - **Client Proposal / Statement of Work (SOW) Export:** 1-click printable & PDF-ready commercial contract with deliverables, financial schedules, and signature blocks.
  - **Interactive Feature Breakdown:** Multi-range steppers (-5/-1/+1/+5), inline title editing, instant category filter pills, and live keyword search.
- **Key Pages:**
  - `/login`: 1-Click Quick Demo Login & Registration
  - `/dashboard`: Executive Analytics, Hero AI Generator with Sample Prompt Chips & Recent Estimates Grid
  - `/projects/[id]`: 2-Column Workspace with Live Interactive Feature Table (CRUD), Risk Profile, 30-40-30 Milestones, and State Machine Action Modals

### **Backend (`/backend`)**
- **Runtime & Server:** Node.js + Express + TypeScript
- **Database & ORM:** PostgreSQL 16 + Prisma ORM (1-to-many cascading relationships)
- **Architecture:** Feature-Based Modular Architecture (`modules/auth`, `modules/project`, `modules/feature`)
- **Business Logic Services:**
  - `calculation.service.ts`: Pure mathematical formulas with zero-cent drift milestone rounding.
  - `workflow.service.ts`: 4 State Machine Guards ensuring business rule compliance.
  - `ai.service.ts`: Dual-mode engine supporting Gemini/OpenAI API + Intelligent Rule-Based Fallback Generator.
- **Security:** Helmet, CORS, bcrypt password hashing, JWT authentication, and Zod validation.

---

## 📂 Project Structure

```text
ntTech-ai-scop/
├── docker-compose.yml              # PostgreSQL 16 Alpine container (Port 5433)
├── package.json                    # Monorepo orchestration scripts
│
├── frontend/                       # Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx      # Page 1: Login with 1-Click Demo
│   │   │   ├── dashboard/page.tsx  # Page 2: Generator & Estimates Grid
│   │   │   ├── projects/[id]/page  # Page 3: Workspace & Live Feature CRUD
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Intelligent redirect router
│   │   ├── components/
│   │   │   └── common/             # Navbar, StatusBadge
│   │   ├── context/                # AuthContext (JWT & Demo login)
│   │   ├── lib/                    # api.ts (Fetch Client) & utils.ts
│   │   └── types/                  # Typed Models & Interfaces
│   ├── package.json
│   └── tsconfig.json
│
└── backend/                        # Modular Node.js + Express API
    ├── prisma/
    │   ├── schema.prisma           # User, Project, Feature models
    │   └── seed.ts                 # Database seeder (Demo users & project)
    ├── src/
    │   ├── config/                 # Environment & Prisma client singleton
    │   ├── app/
    │   │   ├── modules/
    │   │   │   ├── auth/           # Login, Register, Me (JWT + bcrypt)
    │   │   │   ├── project/        # AI Generation, List, Status Transition
    │   │   │   └── feature/        # Feature CRUD & Live Recalculation
    │   │   ├── services/
    │   │   │   ├── calculation.service.ts # Math & Rounding-Safe Milestones
    │   │   │   ├── workflow.service.ts    # 4 State Machine Guards
    │   │   │   ├── ai.service.ts          # AI API + Fallback Engine
    │   │   │   └── __tests__/             # Automated Unit Tests (12 Tests)
    │   │   ├── middlewares/        # Auth, Validation, Global Error, 404
    │   │   └── routes/             # Central API Router (/api/v1)
    │   ├── app.ts                  # Express application setup
    │   └── server.ts               # Server bootstrap & Graceful shutdown
    ├── package.json
    └── tsconfig.json
```

---

## 🧮 Mathematical Formulas & Business Rules

### 1. Calculation Formulas (`calculation.service.ts`)
- **Total Hours:** $\sum (\text{estimatedHours where } isIncluded == true)$
- **Base Cost:** $\text{Total Hours} \times \text{Hourly Rate}$
- **Risk Buffer:**
  - $\text{Low Risk} \rightarrow 5\%$
  - $\text{Medium Risk} \rightarrow 12\%$
  - $\text{High Risk} \rightarrow 20\%$
  $$\text{Risk Buffer Amount} = \text{Base Cost} \times (\text{Buffer \%} \div 100)$$
- **Final Total Cost:** $\text{Base Cost} + \text{Risk Buffer Amount}$
- **Estimated Weeks:** $\lceil \text{Total Hours} \div 30 \rceil$
- **30% - 40% - 30% Milestones:**
  - $\text{Milestone 1} = \text{round}(\text{Final Total Cost} \times 0.30)$
  - $\text{Milestone 2} = \text{round}(\text{Final Total Cost} \times 0.40)$
  - $\text{Milestone 3} = \text{Final Total Cost} - \text{M1} - \text{M2}$ *(Zero cent rounding drift)*

### 2. State Machine Guards (`workflow.service.ts`)
1. **Rule 1 (Empty Scope Guard):** Cannot submit for review if active `totalHours === 0` (`400 Bad Request`).
2. **Rule 2 (Role Guard):** Only `ADMIN` role can approve or reject scopes (`403 Forbidden` for Estimator).
3. **Rule 3 (Rejection Reason Guard):** Rejecting requires a `rejectionReason` of at least 10 characters (`400 Bad Request`).
4. **Rule 4 (Immutability Lock):** Once a project status is `APPROVED`, features cannot be added, modified, or deleted (`400 Bad Request`).

---

## 🚀 Quick Start Guide

### 1. Start PostgreSQL Database
```bash
# Start PostgreSQL container on port 5433
npm run db:up
```

### 2. Seed Database with Demo Accounts & Sample Project
```bash
npm run seed
```

### 3. Run Backend Server
```bash
npm run dev:backend
```
- API Base: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/health`

### 4. Run Frontend Client
In a separate terminal:
```bash
npm run dev:frontend
```
- Open: `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied)

---

## 🧪 Running Automated Tests

Run the backend unit test suite verifying mathematical calculations, risk buffer accuracy, zero-drift milestones, and all 4 state machine guards:

```bash
npm run test:backend
```
All 12 automated test cases pass with 100% precision!
