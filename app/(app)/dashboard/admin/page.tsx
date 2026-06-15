import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getGroupById } from "@/lib/services/groups";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

function computeCyclePending(billingCycle: string): boolean {
  const [monthName, yearStr] = billingCycle.split(" ");
  const cycleMonthIdx = MONTHS.indexOf(monthName as typeof MONTHS[number]);
  const cycleYear = parseInt(yearStr, 10);
  if (cycleMonthIdx === -1 || isNaN(cycleYear)) return false;
  const now = new Date();
  return cycleYear < now.getFullYear() ||
    (cycleYear === now.getFullYear() && cycleMonthIdx < now.getMonth());
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await searchParams;
  if (!groupId) redirect("/grupos");

  const { userId } = await requireAuth();
  const group = await getGroupById(groupId);

  if (!group || group.adminId !== userId) redirect("/grupos");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zimbio.app";
  const inviteUrl = `${appUrl}/invitacion/${group.inviteToken}`;
  const cyclePending = computeCyclePending(group.billingCycle);

  return <AdminDashboard group={group} inviteUrl={inviteUrl} userId={userId} cyclePending={cyclePending} />;
}
