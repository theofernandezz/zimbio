import { calculateTaxBreakdown, calculatePerPersonShare, MOCK_USD_TO_ARS } from "./tax-engine";
import {
  SERVICES,
  PAYMENT_STATUS,
  USER_ROLES,
  type User,
  type SubscriptionService,
  type Group,
  type Payment,
} from "./types";

// ─── Exchange Rate ────────────────────────────────────────────────────────────

export const CURRENT_EXCHANGE_RATE = MOCK_USD_TO_ARS;

// ─── Users ───────────────────────────────────────────────────────────────────
// NOTE: passwords are plaintext — for mock/demo only

export const MOCK_USERS = {
  mateo: {
    id: "usr_001",
    name: "Mateo García",
    email: "mateo@gmail.com",
    password: "admin123",
    role: USER_ROLES.Admin,
    avatarInitials: "MG",
    avatarColor: "#0061FF",
  },
  maria: {
    id: "usr_002",
    name: "Maria Lopez",
    email: "maria@gmail.com",
    password: "maria123",
    role: USER_ROLES.Participant,
    avatarInitials: "ML",
    avatarColor: "#0061FF",
  },
  javier: {
    id: "usr_003",
    name: "Javier Gomez",
    email: "javier@gmail.com",
    password: "javier123",
    role: USER_ROLES.Participant,
    avatarInitials: "JG",
    avatarColor: "#737687",
  },
  sofia: {
    id: "usr_004",
    name: "Sofia Alvarez",
    email: "sofia@gmail.com",
    password: "sofia123",
    role: USER_ROLES.Participant,
    avatarInitials: "SA",
    avatarColor: "#C2C6D9",
  },
} satisfies Record<string, User>;

export const ALL_USERS: User[] = Object.values(MOCK_USERS);

// ─── Subscription Services ───────────────────────────────────────────────────

export const MOCK_SERVICES = {
  netflix: {
    id: "svc_netflix",
    name: "Netflix Premium",
    type: SERVICES.Netflix,
    basePriceUSD: 7.99,  // Netflix Premium 4K shared plan (approx. post-price-change)
    brandColor: "#E50914",
  },
  spotify: {
    id: "svc_spotify",
    name: "Spotify Premium",
    type: SERVICES.Spotify,
    basePriceUSD: 5.99,
    brandColor: "#1DB954",
  },
  disney: {
    id: "svc_disney",
    name: "Disney+",
    type: SERVICES.DisneyPlus,
    basePriceUSD: 4.99,
    brandColor: "#0063E5",
  },
  hbo: {
    id: "svc_hbo",
    name: "Max (HBO)",
    type: SERVICES.HBOMax,
    basePriceUSD: 9.99,
    brandColor: "#5822B4",
  },
  youtube: {
    id: "svc_youtube",
    name: "YouTube Premium",
    type: SERVICES.YouTubePremium,
    basePriceUSD: 6.99,
    brandColor: "#FF0000",
  },
  appleMusic: {
    id: "svc_apple_music",
    name: "Apple Music",
    type: SERVICES.AppleMusic,
    basePriceUSD: 5.99,
    brandColor: "#FC3C44",
  },
} satisfies Record<string, SubscriptionService>;

// ─── Groups ──────────────────────────────────────────────────────────────────

const netflixTax = calculateTaxBreakdown(MOCK_SERVICES.netflix.basePriceUSD);
const MEMBER_COUNT = 4;
const perPersonShare = calculatePerPersonShare(netflixTax.totalARS, MEMBER_COUNT);

const spotifyTax = calculateTaxBreakdown(MOCK_SERVICES.spotify.basePriceUSD);
const SPOTIFY_MEMBER_COUNT = 3;
const spotifyPerPerson = calculatePerPersonShare(spotifyTax.totalARS, SPOTIFY_MEMBER_COUNT);

export const MOCK_GROUPS: Group[] = [
  {
    id: "grp_001",
    name: "Netflix Premium",
    service: MOCK_SERVICES.netflix,
    admin: MOCK_USERS.mateo,
    maxMembers: 4,
    alias: "netflix.grupo.mateo",
    cvu: "0000003100010040012345",
    createdAt: "2025-07-01T00:00:00.000Z",
    billingCycle: "Octubre 2025",
    taxBreakdown: netflixTax,
    inviteLink: "zimbio.app/join/netflix-premium-grp001",
    members: [
      {
        user: MOCK_USERS.mateo,
        paymentStatus: PAYMENT_STATUS.Paid,
        amountDue: perPersonShare,
        amountPaid: perPersonShare,
      },
      {
        user: MOCK_USERS.maria,
        paymentStatus: PAYMENT_STATUS.Paid,
        amountDue: perPersonShare,
        amountPaid: perPersonShare,
      },
      {
        user: MOCK_USERS.javier,
        paymentStatus: PAYMENT_STATUS.Paid,
        amountDue: perPersonShare,
        amountPaid: perPersonShare,
      },
      {
        user: MOCK_USERS.sofia,
        paymentStatus: PAYMENT_STATUS.Pending,
        amountDue: perPersonShare,
        amountPaid: 0,
      },
    ],
  },
  {
    id: "grp_002",
    name: "Spotify con amigos",
    service: MOCK_SERVICES.spotify,
    admin: MOCK_USERS.mateo,
    maxMembers: 3,
    alias: "spotify.mateo.mp",
    cvu: "0000003100010040012346",
    createdAt: "2025-10-01T00:00:00.000Z",
    billingCycle: "Mayo 2026",
    taxBreakdown: spotifyTax,
    inviteLink: "zimbio.app/join/spotify-grp002",
    members: [
      {
        user: MOCK_USERS.mateo,
        paymentStatus: PAYMENT_STATUS.Paid,
        amountDue: spotifyPerPerson,
        amountPaid: spotifyPerPerson,
      },
      {
        user: MOCK_USERS.maria,
        paymentStatus: PAYMENT_STATUS.Pending,
        amountDue: spotifyPerPerson,
        amountPaid: 0,
      },
      {
        user: MOCK_USERS.javier,
        paymentStatus: PAYMENT_STATUS.Pending,
        amountDue: spotifyPerPerson,
        amountPaid: 0,
      },
    ],
  },
];

// ─── Payment History ──────────────────────────────────────────────────────────

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_001",
    groupId: "grp_001",
    userId: "usr_004",
    amountARS: perPersonShare,
    month: "Septiembre 2025",
    status: PAYMENT_STATUS.Paid,
    paidAt: "2025-09-03T10:30:00.000Z",
  },
  {
    id: "pay_002",
    groupId: "grp_001",
    userId: "usr_004",
    amountARS: perPersonShare,
    month: "Agosto 2025",
    status: PAYMENT_STATUS.Paid,
    paidAt: "2025-08-02T09:15:00.000Z",
  },
  {
    id: "pay_003",
    groupId: "grp_001",
    userId: "usr_004",
    amountARS: perPersonShare,
    month: "Octubre 2025",
    status: PAYMENT_STATUS.Pending,
  },
];

// ─── Auth helper ──────────────────────────────────────────────────────────────

/**
 * Validates mock credentials.
 * Returns the matched User or null.
 */
export function findUserByCredentials(
  email: string,
  password: string,
): User | null {
  return ALL_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password,
  ) ?? null;
}
