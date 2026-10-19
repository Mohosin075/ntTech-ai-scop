-- Projects without included features were not covered by the preceding
-- backfill. Their old hourly rate must not become a scope-point price.
UPDATE "projects"
SET "scope_point_value" = 350
WHERE "total_scope_points" = 0;
