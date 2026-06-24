// ─── Service Types ──────────────────────────────────────────────────────────

export const SERVICES = {
  Netflix: "netflix",
  Spotify: "spotify",
  DisneyPlus: "disney_plus",
  HBOMax: "hbo_max",
  AppleTV: "apple_tv",
  YouTubePremium: "youtube_premium",
  AppleMusic: "apple_music",
  ParamountPlus: "paramount_plus",
  AppleTVPlus: "apple_tv_plus",
  Crunchyroll: "crunchyroll",
  Other: "other",
} as const;

export type ServiceType = (typeof SERVICES)[keyof typeof SERVICES];

// ─── Payment Status ──────────────────────────────────────────────────────────

export const PAYMENT_STATUS = {
  Pending: "pending",
  Paid: "paid",
  Overdue: "overdue",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ─── User Roles ──────────────────────────────────────────────────────────────

export const USER_ROLES = {
  Admin: "admin",
  Participant: "participant",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // NOTE: plaintext for mock only — never do this in prod
  role: UserRole;
  avatarInitials: string;
  avatarColor: string;
}

/**
 * Result from the tax engine after applying Argentine digital tax regulations.
 * All amounts are in ARS.
 */
export interface TaxBreakdown {
  basePriceARS: number;
  ivaAmount: number;       // 21%
  paisAmount: number;      // 7.5% (post-reducción 2024)
  percepcionAmount: number; // 45% percepción AFIP
  totalARS: number;
  effectiveTaxRate: number; // decimal, e.g. 0.735
}

export interface SubscriptionService {
  id: string;
  name: string;
  type: ServiceType;
  basePriceUSD: number;
  brandColor: string; // for avatars and badges
}

export interface GroupMember {
  user: User;
  paymentStatus: PaymentStatus;
  amountDue: number;  // ARS — per-person share
  amountPaid: number; // ARS — what they've actually sent
}

export interface Group {
  id: string;
  name: string;
  service: SubscriptionService;        // primary (for display fallback)
  services?: SubscriptionService[];    // all services if multi-service group
  admin: User;
  members: GroupMember[]; // includes admin as first member
  maxMembers: number;
  alias: string;  // Mercado Pago alias for receiving payments
  cvu: string;    // CVU for bank transfers
  createdAt: string;       // ISO date string
  billingCycle: string;    // e.g. "Octubre 2025"
  taxBreakdown: TaxBreakdown;
  inviteLink: string;
}

export interface Payment {
  id: string;
  groupId: string;
  userId: string;
  amountARS: number;
  month: string; // e.g. "Septiembre 2025"
  status: PaymentStatus;
  paidAt?: string; // ISO date string
}
