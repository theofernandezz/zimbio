import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// ─── Tipos ────────────────────────────────────────────────────────────────────

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  avatarColor: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof userPublicSelect;
}>;

// ─── Paleta de colores para avatars ──────────────────────────────────────────

const AVATAR_COLORS = [
  "#0061FF",
  "#7C3AED",
  "#059669",
  "#DC2626",
  "#D97706",
  "#0891B2",
] as const;

function pickAvatarColor(email: string): string {
  return AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const userService = {
  async findById(id: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });
  },

  // Incluye passwordHash — solo para verificación en login
  async findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        ...userPublicSelect,
        passwordHash: true,
      },
    });
  },

  async findByGoogleId(googleId: string): Promise<UserPublic | null> {
    return prisma.user.findUnique({
      where: { googleId },
      select: userPublicSelect,
    });
  },

  // Busca por email e incluye googleId — para vincular cuentas existentes
  async findByEmailForGoogle(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { ...userPublicSelect, googleId: true },
    });
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<UserPublic> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        avatarColor: pickAvatarColor(data.email),
      },
      select: userPublicSelect,
    });
  },

  // Crea usuario via Google OAuth (sin contraseña)
  async createFromGoogle(data: {
    name: string;
    email: string;
    googleId: string;
  }): Promise<UserPublic> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        googleId: data.googleId,
        avatarColor: pickAvatarColor(data.email),
      },
      select: userPublicSelect,
    });
  },

  // Vincula googleId a una cuenta existente (email ya registrado con contraseña)
  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  },

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  },

  async hasPassword(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    return !!user?.passwordHash;
  },
};
