import { requireAuth } from "@/lib/auth";
import { userService } from "@/lib/services/users";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const { userId } = await requireAuth();
  const [user, hasPassword] = await Promise.all([
    userService.findById(userId),
    userService.hasPassword(userId),
  ]);

  return <SettingsForm user={user!} hasPassword={hasPassword} />;
}
