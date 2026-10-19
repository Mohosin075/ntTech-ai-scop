ALTER TABLE "projects" RENAME COLUMN "hourly_rate" TO "scope_point_value";
ALTER TABLE "projects" ALTER COLUMN "scope_point_value" SET DEFAULT 350;
ALTER TABLE "projects" ADD COLUMN "total_scope_points" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Preserve every existing quote while translating its legacy rate into a
-- per-project scope-point value for future scope edits.
WITH project_points AS (
  SELECT
    f."project_id",
    SUM(
      (CASE f."complexity" WHEN 'LOW' THEN 1.5 WHEN 'HIGH' THEN 5 ELSE 3 END)
      *
      (CASE f."category"
        WHEN 'FRONTEND' THEN 0.95
        WHEN 'BACKEND' THEN 1.1
        WHEN 'DATABASE' THEN 1.2
        WHEN 'INTEGRATION' THEN 1.25
        WHEN 'AI' THEN 1.35
        ELSE 1.1
      END)
    ) AS points
  FROM "features" f
  WHERE f."is_included" = true
  GROUP BY f."project_id"
)
UPDATE "projects" p
SET
  "total_scope_points" = pp.points,
  "scope_point_value" = CASE
    WHEN pp.points > 0 AND p."base_cost" > 0 THEN p."base_cost" / pp.points
    ELSE 350
  END
FROM project_points pp
WHERE p."id" = pp."project_id";
