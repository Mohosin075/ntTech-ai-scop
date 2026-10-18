# Fullstack Job Assessment Starter Template

An industry-standard fullstack monorepo starter built for technical assessments and scalable web applications.

---

## 🛠 Tech Stack

### **Frontend** (`/frontend`)
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Structure:** Modular architecture (`src/app`, `src/components`, `src/lib`, `src/types`)

### **Backend** (`/backend`)
- **Runtime & Framework:** [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM & Database:** [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
- **Validation:** [Zod](https://zod.dev/)
- **Security:** Helmet, CORS, centralized Error Handling & typed responses
- **Architecture:** Layered Architecture (`routes` → `middlewares` → `controllers` → `services` → `prisma`)

---

## 📂 Project Architecture

```text
ntTech-ai-scop/
├── docker-compose.yml          # Optional: Instant PostgreSQL database container
├── package.json                # Root scripts to orchestrate frontend & backend
│
├── frontend/                   # Next.js Application
│   ├── src/
│   │   ├── app/                # App Router (layout, page, globals.css)
│   │   ├── components/         # UI & shared components
│   │   ├── lib/                # api.ts (fetch client), utils.ts (cn)
│   │   └── types/              # Typed models & API response interfaces
│   ├── .env.example
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
│
└── backend/                    # Modular Express + Prisma + PostgreSQL API
    ├── prisma/
    │   └── schema.prisma       # Database schema (PostgreSQL)
    ├── src/
    │   ├── config/             # Environment (index.ts) & Prisma client singleton (prisma.ts)
    │   ├── app/
    │   │   ├── modules/        # Feature Modules
    │   │   │   ├── user/       # user.controller, user.service, user.routes, user.validation, user.interface
    │   │   │   └── task/       # task.controller, task.service, task.routes, task.validation, task.interface
    │   │   ├── middlewares/    # globalErrorHandler, notFound, validateRequest
    │   │   ├── utils/          # catchAsync, sendResponse
    │   │   ├── errors/         # AppError class
    │   │   └── routes/         # Central router (index.ts)
    │   ├── app.ts              # Express setup & middlewares
    │   └── server.ts           # Server bootstrap & graceful shutdown
    ├── .env.example
    ├── .env
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (PostgreSQL)
You can use your local PostgreSQL service or run the preconfigured Docker container:
```bash
# Start PostgreSQL via Docker:
npm run db:up
```
Ensure your `backend/.env` has the correct database connection string:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/assessment_db?schema=public"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies (already completed)
npm install

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```
Backend will be available at: **`http://localhost:5000`**  
Health Check: **`http://localhost:5000/health`**  
API base: **`http://localhost:5000/api/v1`**

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Install dependencies (already completed)
npm install

# Start Next.js development server
npm run dev
```
Frontend will be running at: **`http://localhost:3000`**

---

## 📦 Available Scripts

### Root Commands
- `npm run dev:frontend`: Starts the Next.js frontend dev server.
- `npm run dev:backend`: Starts the Express backend dev server.
- `npm run build:frontend`: Builds the production frontend bundle.
- `npm run build:backend`: Builds the backend TypeScript project to `/dist`.
- `npm run db:up`: Starts PostgreSQL in background via Docker.
- `npm run db:down`: Stops PostgreSQL Docker container.

### Backend Specific Commands
- `npm run prisma:migrate`: Runs pending Prisma migrations.
- `npm run prisma:generate`: Re-generates Prisma client.
- `npm run prisma:studio`: Opens interactive GUI to view and edit database data.
