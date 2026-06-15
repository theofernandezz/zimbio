-- Primary key was already applied in a prior failed attempt; only drop the now-redundant unique constraint
ALTER TABLE "_GroupToServicePlan" DROP CONSTRAINT "_GroupToServicePlan_AB_unique";

-- AlterTable: add access_type to service plans
ALTER TABLE "service_plans" ADD COLUMN "access_type" TEXT NOT NULL DEFAULT 'credentials';
