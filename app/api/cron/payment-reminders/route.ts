import type { NextRequest } from "next/server";
import { endOfBillingCycle } from "@/lib/billing-cycle";
import { prisma } from "@/lib/db";
import { notifyAdminPaymentReminder } from "@/lib/email/notifications";

const REMINDER_DAYS_BEFORE_CLOSE = 3;

function daysUntil(target: Date, now: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target.getTime() - now.getTime()) / msPerDay);
}

export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const groups = await prisma.group.findMany({
      select: {
        name: true,
        billingCycle: true,
        admin: { select: { name: true, email: true } },
        members: {
          select: { paymentStatus: true, user: { select: { name: true } } },
        },
      },
    });

    const now = new Date();
    let remindersSent = 0;

    for (const group of groups) {
      const cycleEnd = endOfBillingCycle(group.billingCycle);
      if (!cycleEnd) continue;

      if (daysUntil(cycleEnd, now) !== REMINDER_DAYS_BEFORE_CLOSE) continue;

      const unpaidNames = group.members
        .filter((m) => m.paymentStatus !== "paid")
        .map((m) => m.user.name);

      if (unpaidNames.length === 0) continue;

      await notifyAdminPaymentReminder(
        group.admin,
        group.name,
        unpaidNames,
        REMINDER_DAYS_BEFORE_CLOSE,
      );
      remindersSent += 1;
    }

    return Response.json({ checked: groups.length, remindersSent });
  } catch (error) {
    console.error("Error en cron payment-reminders:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
