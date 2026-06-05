import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getGroupById } from "@/lib/services/groups";
import { userService } from "@/lib/services/users";
import { ParticipantDashboard } from "@/components/dashboard/participant-dashboard";

export default async function ParticipantDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const { groupId } = await searchParams;
  if (!groupId) redirect("/grupos");

  const { userId } = await requireAuth();

  const [group, user] = await Promise.all([
    getGroupById(groupId),
    userService.findById(userId),
  ]);

  if (!group || !user) redirect("/grupos");

  // Buscar el registro del usuario como miembro
  const myMember = group.members.find((m) => m.userId === userId);
  if (!myMember) redirect("/grupos");

  return (
    <ParticipantDashboard
      group={group}
      myMemberId={myMember.id}
      myAmountDue={myMember.amountDue}
      isPaid={myMember.paymentStatus === "paid"}
      userName={user.name}
    />
  );
}
