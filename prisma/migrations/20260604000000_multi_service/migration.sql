-- Paso 1: crear tabla join para la relación many-to-many Group ↔ ServicePlan
CREATE TABLE "_GroupToServicePlan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupToServicePlan_AB_unique" UNIQUE ("A", "B")
);

CREATE INDEX "_GroupToServicePlan_B_index" ON "_GroupToServicePlan"("B");

ALTER TABLE "_GroupToServicePlan"
    ADD CONSTRAINT "_GroupToServicePlan_A_fkey"
    FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_GroupToServicePlan"
    ADD CONSTRAINT "_GroupToServicePlan_B_fkey"
    FOREIGN KEY ("B") REFERENCES "service_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Paso 2: migrar datos existentes (service_plan_id → join table)
INSERT INTO "_GroupToServicePlan" ("A", "B")
SELECT "id", "service_plan_id" FROM "groups";

-- Paso 3: agregar columna max_members usando el valor del plan actual
ALTER TABLE "groups" ADD COLUMN "max_members" INTEGER;

UPDATE "groups" g
SET "max_members" = sp."max_members"
FROM "service_plans" sp
WHERE sp."id" = g."service_plan_id";

ALTER TABLE "groups" ALTER COLUMN "max_members" SET NOT NULL;

-- Paso 4: eliminar la FK y la columna service_plan_id
ALTER TABLE "groups" DROP CONSTRAINT IF EXISTS "groups_service_plan_id_fkey";
ALTER TABLE "groups" DROP COLUMN "service_plan_id";
