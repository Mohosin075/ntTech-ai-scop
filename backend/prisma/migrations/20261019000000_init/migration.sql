-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ESTIMATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('AI_ESTIMATED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'INTEGRATION', 'AI');

-- CreateEnum
CREATE TYPE "FeatureComplexity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ESTIMATOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "raw_requirement" TEXT NOT NULL,
    "hourly_rate" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "status" "ProjectStatus" NOT NULL DEFAULT 'AI_ESTIMATED',
    "executive_summary" TEXT NOT NULL,
    "risk_level" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "recommended_stack" TEXT[],
    "ai_confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 85,
    "is_fallback_used" BOOLEAN NOT NULL DEFAULT false,
    "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "base_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "risk_buffer_percent" DOUBLE PRECISION NOT NULL DEFAULT 12,
    "risk_buffer_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "final_total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimated_weeks" INTEGER NOT NULL DEFAULT 1,
    "milestone_1_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "milestone_2_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "milestone_3_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rejection_reason" TEXT,
    "reviewed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL DEFAULT 'BACKEND',
    "complexity" "FeatureComplexity" NOT NULL DEFAULT 'MEDIUM',
    "estimated_hours" DOUBLE PRECISION NOT NULL,
    "is_included" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_created_by_id_idx" ON "projects"("created_by_id");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "features_project_id_idx" ON "features"("project_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
