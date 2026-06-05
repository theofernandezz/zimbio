import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { userService } from "@/lib/services/users";
import { getGroupsByUser } from "@/lib/services/groups";
import { OnboardingHome } from "@/components/home/onboarding-home";

export default async function HomePage() {
  const { userId } = await requireAuth();

  const [user, { adminGroups, participantGroups }] = await Promise.all([
    userService.findById(userId),
    getGroupsByUser(userId),
  ]);

  if (adminGroups.length > 0 || participantGroups.length > 0) {
    redirect("/grupos");
  }

  const firstName = user?.name.split(" ")[0] ?? "allá";

  return <OnboardingHome firstName={firstName} />;
}
