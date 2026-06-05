-- AddUniqueConstraint: service_plans(service_id, name)
CREATE UNIQUE INDEX "service_plans_service_id_name_key" ON "service_plans"("service_id", "name");
