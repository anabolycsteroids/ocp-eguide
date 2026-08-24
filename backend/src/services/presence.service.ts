import { prisma } from "../config/database";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export class PresenceService {
  async get(userId: string) {
    const presence = await prisma.presence.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });
    if (!presence) throw new NotFoundError("Presence record not found");
    return this.computeEffectiveStatus(presence);
  }

  async getAll() {
    const presences = await prisma.presence.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });
    return presences.map((p) => this.computeEffectiveStatus(p));
  }

  async getMultiple(userIds: string[]) {
    const presences = await prisma.presence.findMany({
      where: { userId: { in: userIds } },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });
    return presences.map((p) => this.computeEffectiveStatus(p));
  }

  async setStatus(userId: string, status: "ACTIVE" | "BUSY", statusNote?: string) {
    const existing = await prisma.presence.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundError("Presence record not found");

    const presence = await prisma.presence.update({
      where: { userId },
      data: {
        status,
        statusNote: statusNote || null,
        lastSeen: new Date(),
        lastHeartbeat: new Date(),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { status: status === "ACTIVE" ? "ONLINE" : "BUSY", lastActiveAt: new Date() },
    });

    return this.computeEffectiveStatus(presence);
  }

  async heartbeat(userId: string) {
    const existing = await prisma.presence.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundError("Presence record not found");

    const presence = await prisma.presence.update({
      where: { userId },
      data: {
        lastHeartbeat: new Date(),
        lastSeen: new Date(),
        status: existing.status === "OFFLINE" ? "ACTIVE" : existing.status,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { status: "ONLINE", lastActiveAt: new Date() },
    });

    return this.computeEffectiveStatus(presence);
  }

  async markOffline(userId: string) {
    const existing = await prisma.presence.findUnique({ where: { userId } });
    if (!existing) throw new NotFoundError("Presence record not found");

    const presence = await prisma.presence.update({
      where: { userId },
      data: { status: "OFFLINE" },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { status: "OFFLINE" },
    });

    return this.computeEffectiveStatus(presence);
  }

  async sweepStaleHeartbeats() {
    const cutoff = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);
    const result = await prisma.presence.updateMany({
      where: {
        status: { not: "OFFLINE" },
        lastHeartbeat: { lt: cutoff },
      },
      data: { status: "OFFLINE" },
    });

    if (result.count > 0) {
      const staleUserIds = (
        await prisma.presence.findMany({
          where: { status: "OFFLINE" },
          select: { userId: true },
        })
      ).map((p) => p.userId);

      await prisma.user.updateMany({
        where: { id: { in: staleUserIds } },
        data: { status: "OFFLINE" },
      });
    }

    return result.count;
  }

  private computeEffectiveStatus(presence: any) {
    const now = new Date();
    const lastHeartbeat = new Date(presence.lastHeartbeat);
    const diffMs = now.getTime() - lastHeartbeat.getTime();
    const isStale = diffMs > HEARTBEAT_TIMEOUT_MS;

    let effectiveStatus = presence.status;
    if (presence.status !== "OFFLINE" && isStale) {
      effectiveStatus = "OFFLINE";
    }

    let statusLabel = "Offline";
    if (effectiveStatus === "ACTIVE") statusLabel = "Active";
    else if (effectiveStatus === "BUSY") statusLabel = "Busy";

    return {
      userId: presence.userId,
      user: presence.user,
      status: effectiveStatus,
      statusLabel,
      statusNote: presence.statusNote,
      lastSeen: presence.lastSeen,
      lastHeartbeat: presence.lastHeartbeat,
    };
  }
}

export const presenceService = new PresenceService();
