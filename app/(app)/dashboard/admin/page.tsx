import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getGroupById } from "@/lib/services/groups";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await searchParams;
  if (!groupId) redirect("/grupos");

  const { userId } = await requireAuth();
  const group = await getGroupById(groupId);

  // Solo el admin del grupo puede ver este dashboard
  if (!group || group.adminId !== userId) redirect("/grupos");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zimbio.app";
  const inviteUrl = `${appUrl}/invitacion/${group.inviteToken}`;

  return <AdminDashboard group={group} inviteUrl={inviteUrl} userId={userId} />;
}
