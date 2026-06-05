import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

// Shape completo para dashboards
const groupDetailInclude = {
  servicePlans: {
    include: {
      service: {
        select: { id: true, name: true, type: true, brandColor: true },
      },
    },
  },
  admin: {
    select: { id: true, name: true, email: true, avatarColor: true },
  },
  members: {
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarColor: true },
      },
    },
    orderBy: { joinedAt: "asc" as const },
  },
} satisfies Prisma.GroupInclude;

export type GroupDetail = Prisma.GroupGetPayload<{
  include: typeof groupDetailInclude;
}>;

// Shape liviano para el listado de /grupos
const groupSummaryInclude = {
  servicePlans: {
    include: {
      service: { select: { name: true, type: true, brandColor: true } },
    },
  },
  members: {
    select: { userId: true, paymentStatus: true, amountDue: true },
  },
} satisfies Prisma.GroupInclude;

export type GroupSummary = Prisma.GroupGetPayload<{
  include: typeof groupSummaryInclude;
}>;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getGroupsByUser(userId: string): Promise<{
  adminGroups: GroupSummary[];
  participantGroups: GroupSummary[];
}> {
  const [adminGroups, memberGroups] = await Promise.all([
    prisma.group.findMany({
      where: { adminId: userId },
      include: groupSummaryInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.group.findMany({
      where: {
        adminId: { not: userId },
        members: { some: { userId } },
      },
      include: groupSummaryInclude,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { adminGroups, participantGroups: memberGroups };
}

export async function getGroupById(
  groupId: string,
): Promise<GroupDetail | null> {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: groupDetailInclude,
  });
}

export async function getGroupByInviteToken(
  token: string,
): Promise<GroupDetail | null> {
  return prisma.group.findUnique({
    where: { inviteToken: token },
    include: groupDetailInclude,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

interface CreateGroupInput {
  name: string;
  adminId: string;
  servicePlanIds: string[];
  maxMembers: number;
  paymentMethod: string;
  monthlyTotal: number;
  alias: string;
  cvu: string;
  billingCycle: string;
  inviteToken: string;
}

export async function createGroup(input: CreateGroupInput): Promise<GroupDetail> {
  const amountDue = Math.round(input.monthlyTotal / input.maxMembers);

  return prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        name: input.name,
        adminId: input.adminId,
        maxMembers: input.maxMembers,
        servicePlans: { connect: input.servicePlanIds.map((id) => ({ id })) },
        paymentMethod: input.paymentMethod,
        monthlyTotal: input.monthlyTotal,
        alias: input.alias,
        cvu: input.cvu,
        billingCycle: input.billingCycle,
        inviteToken: input.inviteToken,
      },
      include: groupDetailInclude,
    });

    // El admin es automáticamente el primer miembro
    await tx.groupMember.create({
      data: {
        groupId: group.id,
        userId: input.adminId,
        amountDue,
        paymentStatus: "pending",
      },
    });

    // Devolver el grupo con el miembro creado
    return tx.group.findUniqueOrThrow({
      where: { id: group.id },
      include: groupDetailInclude,
    });
  });
}

export async function updateMemberPaymentStatus(
  memberId: string,
  status: "paid" | "pending",
): Promise<void> {
  await prisma.groupMember.update({
    where: { id: memberId },
    data: { paymentStatus: status },
  });
}

export async function joinGroup(
  groupId: string,
  userId: string,
): Promise<void> {
  const group = await prisma.group.findUniqueOrThrow({
    where: { id: groupId },
    include: { members: true },
  });

  if (group.members.length >= group.maxMembers) {
    throw new Error("El grupo ya está completo");
  }

  const alreadyMember = group.members.some((m) => m.userId === userId);
  if (alreadyMember) {
    throw new Error("Ya sos miembro de este grupo");
  }

  const amountDue = Math.round(group.monthlyTotal / group.maxMembers);

  await prisma.groupMember.create({
    data: {
      groupId,
      userId,
      amountDue,
      paymentStatus: "pending",
    },
  });
}
