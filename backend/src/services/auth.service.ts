import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";
import { config } from "../config";
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError, ForbiddenError } from "../middleware/errorHandler";
import { JwtPayload } from "../types";
import { nanoid } from "nanoid";

function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
}

function generateRefreshToken(): string {
  return nanoid(64);
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const num = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s": return num * 1000;
    case "m": return num * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "d": return num * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

export class AuthService {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
    position?: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: (data.role as any) || "EMPLOYEE",
        department: (data.department as any) || "OTHER",
        position: data.position,
        phone: data.phone,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(email: string, password: string, profileSlug?: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.accountStatus !== "ACTIVE") {
      throw new UnauthorizedError("Account is not active");
    }

    if (!user.profile) {
      throw new ForbiddenError("PROFILE_MISMATCH", "This account has no assigned profile. Contact administrator.");
    }

    if (!user.profile.active) {
      throw new ForbiddenError("PROFILE_MISMATCH", "This account's profile is deactivated. Contact administrator.");
    }

    if (profileSlug && user.profile.slug !== profileSlug) {
      throw new ForbiddenError(
        "PROFILE_MISMATCH",
        `This account is authorized for profile "${user.profile.name}" (${user.profile.slug}), not "${profileSlug}".`
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), status: "ONLINE", lastActiveAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.profile.slug);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshTokenStr: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: { include: { profile: true } } },
    });

    if (!refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (refreshToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
      throw new UnauthorizedError("Refresh token expired");
    }

    await prisma.refreshToken.delete({ where: { id: refreshToken.id } });

    const tokens = await this.generateTokens(
      refreshToken.user.id,
      refreshToken.user.email,
      refreshToken.user.role,
      refreshToken.user.profile?.slug
    );

    return tokens;
  }

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { status: "OFFLINE", lastActiveAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        supervisor: {
          include: { profile: true },
        },
        internProfile: true,
        supervisorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.sanitizeUser(user);
  }

  async generateTokens(userId: string, email: string, role: string, profileSlug?: string) {
    const payload: JwtPayload = { userId, email, role, profileSlug };
    const accessToken = generateAccessToken(payload);

    const refreshTokenStr = generateRefreshToken();
    const refreshDuration = parseDuration(config.jwt.refreshExpiresIn);

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenStr,
        userId,
        expiresAt: new Date(Date.now() + refreshDuration),
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      expiresIn: config.jwt.expiresIn,
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const authService = new AuthService();
