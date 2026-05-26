import { MOCK_GROUPS } from "./mock-data";
import { PAYMENT_STATUS, USER_ROLES } from "./types";
import type { Group, GroupMember, User, SubscriptionService, TaxBreakdown } from "./types";

const STORAGE_KEY = "zimbio_user_groups";

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getStoredGroups(): Group[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Group[]) : [];
  } catch {
    return [];
  }
}

export function saveGroupToStorage(group: Group): void {
  const existing = getStoredGroups();
  // Replace if same id, otherwise prepend
  const updated = [group, ...existing.filter(g => g.id !== group.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Returns user-created groups from localStorage.
 * Falls back to MOCK_GROUPS only when nothing has been created yet
 * (demo context: Mateo/Sofia pre-loaded data).
 */
export function getAllGroups(): Group[] {
  const stored = getStoredGroups();
  return stored.length > 0 ? stored : [...MOCK_GROUPS];
}

// ─── Build a Group from the create-form data ──────────────────────────────────

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface CreatedGroupData {
  groupName: string;
  service: SubscriptionService;
  services?: SubscriptionService[];
  memberCount: number;
  alias: string;
  cvu: string;
  taxBreakdown: TaxBreakdown;
  perPerson: number;
  inviteId: string;
}

export function buildAndSaveGroup(data: CreatedGroupData, admin: User): Group {
  const now = new Date();
  const billingCycle = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  const adminMember: GroupMember = {
    user: admin,
    paymentStatus: PAYMENT_STATUS.Paid,
    amountDue: data.perPerson,
    amountPaid: data.perPerson,
  };

  // Placeholder slots for members not yet joined
  const placeholders: GroupMember[] = Array.from(
    { length: data.memberCount - 1 },
    (_, i) => ({
      user: {
        id: `slot_${data.inviteId}_${i}`,
        name: `Invitado ${i + 1}`,
        email: "",
        password: "",
        role: USER_ROLES.Participant,
        avatarInitials: "?",
        avatarColor: "#C2C6D9",
      },
      paymentStatus: PAYMENT_STATUS.Pending,
      amountDue: data.perPerson,
      amountPaid: 0,
    })
  );

  const group: Group = {
    id: `grp_${data.inviteId}`,
    name: data.groupName,
    service: data.service,
    services: data.services && data.services.length > 1 ? data.services : undefined,
    admin,
    maxMembers: data.memberCount,
    alias: data.alias,
    cvu: data.cvu,
    createdAt: now.toISOString(),
    billingCycle,
    taxBreakdown: data.taxBreakdown,
    inviteLink: `zimbio.app/join/${data.inviteId}`,
    members: [adminMember, ...placeholders],
  };

  saveGroupToStorage(group);
  return group;
}
