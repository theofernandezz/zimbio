-- Migration: vault_per_service
-- Adds per-service credentials: each group can have one VaultEntry per service.
-- Existing entries are assigned the first service type of their group.

-- 1. Add service_type column (nullable for data migration)
ALTER TABLE "vault_entries" ADD COLUMN "service_type" TEXT;

-- 2. Populate service_type from each group's first service (alphabetical by type)
UPDATE "vault_entries" ve
SET "service_type" = (
  SELECT s.type
  FROM "_GroupToServicePlan" gsp
  JOIN "service_plans" sp ON gsp."B" = sp.id
  JOIN "services" s ON s.id = sp."service_id"
  WHERE gsp."A" = ve."group_id"
  ORDER BY s.type
  LIMIT 1
);

-- 3. Fallback for any entries without a matching service
UPDATE "vault_entries" SET "service_type" = 'unknown' WHERE "service_type" IS NULL;

-- 4. Make NOT NULL
ALTER TABLE "vault_entries" ALTER COLUMN "service_type" SET NOT NULL;

-- 5. Drop old unique index on group_id alone
DROP INDEX "vault_entries_group_id_key";

-- 6. New unique index on (group_id, service_type)
CREATE UNIQUE INDEX "vault_entries_group_id_service_type_key" ON "vault_entries"("group_id", "service_type");
