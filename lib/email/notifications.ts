import { emailEnv } from "./env";
import { resend } from "./resend";
import {
  cycleRenewedAdminEmail,
  cycleRenewedParticipantEmail,
  memberJoinedAdminEmail,
  memberJoinedParticipantEmail,
  memberLeftAdminEmail,
  paymentReminderAdminEmail,
} from "./templates";

interface Recipient {
  email: string;
  name: string;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend || !emailEnv) return;

  try {
    await resend.emails.send({
      from: emailEnv.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Error enviando email a ${to}:`, error);
  }
}

export async function notifyAdminMemberJoined(
  admin: Recipient,
  groupName: string,
  newMemberName: string,
): Promise<void> {
  const { subject, html } = memberJoinedAdminEmail(groupName, newMemberName);
  await sendEmail(admin.email, subject, html);
}

export async function notifyParticipantsMemberJoined(
  participants: Recipient[],
  groupName: string,
  newMemberName: string,
): Promise<void> {
  const { subject, html } = memberJoinedParticipantEmail(groupName, newMemberName);
  await Promise.all(participants.map((p) => sendEmail(p.email, subject, html)));
}

export async function notifyAdminMemberLeft(
  admin: Recipient,
  groupName: string,
  memberName: string,
): Promise<void> {
  const { subject, html } = memberLeftAdminEmail(groupName, memberName);
  await sendEmail(admin.email, subject, html);
}

export async function notifyAdminCycleRenewed(
  admin: Recipient,
  groupName: string,
  newCycle: string,
): Promise<void> {
  const { subject, html } = cycleRenewedAdminEmail(groupName, newCycle);
  await sendEmail(admin.email, subject, html);
}

export async function notifyParticipantsCycleRenewed(
  participants: Recipient[],
  groupName: string,
  newCycle: string,
): Promise<void> {
  const { subject, html } = cycleRenewedParticipantEmail(groupName, newCycle);
  await Promise.all(participants.map((p) => sendEmail(p.email, subject, html)));
}

export async function notifyAdminPaymentReminder(
  admin: Recipient,
  groupName: string,
  unpaidNames: string[],
  daysLeft: number,
): Promise<void> {
  const { subject, html } = paymentReminderAdminEmail(groupName, unpaidNames, daysLeft);
  await sendEmail(admin.email, subject, html);
}
