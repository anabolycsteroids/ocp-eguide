import { prisma } from "../config/database";
import { notificationService } from "./notification.service";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { VisitStatus } from "@prisma/client";

const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

const VISIT_INCLUDE = {
  host: {
    select: { id: true, firstName: true, lastName: true, department: true, position: true },
  },
  place: {
    select: { id: true, name: true, code: true, capacity: true, currentOccupancy: true, status: true },
  },
};

const ACTIVE_STATUSES: VisitStatus[] = ["PENDING", "APPROVED", "ARRIVED", "IN_PROGRESS"];

export class GuestService {
  async getMyVisits(visitorId: string) {
    return prisma.visit.findMany({
      where: { visitorId },
      include: VISIT_INCLUDE,
      orderBy: { scheduledDate: "desc" },
    });
  }

  async searchHosts(query: string) {
    const q = query.trim();
    if (q.length < 1) return [];

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { profile: { category: "employee" } },
          {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        profile: { select: { name: true, slug: true } },
      },
      take: 10,
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      department: u.department,
      profile: u.profile?.name || "",
    }));
  }

  async getMyActiveVisit(visitorId: string) {
    return prisma.visit.findFirst({
      where: { visitorId, status: { in: ACTIVE_STATUSES } },
      include: VISIT_INCLUDE,
      orderBy: { scheduledDate: "desc" },
    });
  }

  async getVisitById(visitId: string, visitorId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: VISIT_INCLUDE,
    });

    if (!visit || visit.visitorId !== visitorId) {
      throw new NotFoundError("Visit not found");
    }

    return visit;
  }

  async checkIn(visitId: string, visitorId: string) {
    const existing = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { visitor: { select: { id: true, firstName: true, lastName: true } } },
    });

    if (!existing || existing.visitorId !== visitorId) {
      throw new NotFoundError("Visit not found");
    }

    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: {
        status: VisitStatus.ARRIVED,
        checkedInAt: new Date(),
      },
      include: VISIT_INCLUDE,
    });

    await notificationService.create({
      recipientId: existing.hostId,
      senderId: visitorId,
      title: "New Visitor",
      message: `${existing.visitor?.firstName} ${existing.visitor?.lastName} has arrived. Purpose: ${existing.purpose}`,
      type: "GENERAL",
    });

    return visit;
  }

  async checkOut(visitId: string, visitorId: string) {
    const existing = await prisma.visit.findUnique({ where: { id: visitId } });

    if (!existing || existing.visitorId !== visitorId) {
      throw new NotFoundError("Visit not found");
    }

    return prisma.visit.update({
      where: { id: visitId },
      data: {
        status: VisitStatus.COMPLETED,
        checkedOutAt: new Date(),
      },
      include: VISIT_INCLUDE,
    });
  }

  async getHostPresence(hostId: string) {
    const presence = await prisma.presence.findUnique({
      where: { userId: hostId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true, department: true },
        },
      },
    });

    if (!presence) {
      return {
        userId: hostId,
        user: null,
        status: "OFFLINE",
        statusLabel: "Offline",
        statusNote: null,
        lastSeen: null,
        lastHeartbeat: null,
      };
    }

    return this.computeEffectiveStatus(presence);
  }

  async createVisit(
    visitorId: string,
    data: {
      hostId: string;
      placeId?: string;
      purpose: string;
      scheduledDate: Date;
      scheduledTime?: string;
      notes?: string;
    }
  ) {
    const host = await prisma.user.findUnique({ where: { id: data.hostId } });
    if (!host) throw new NotFoundError("Host not found");

    if (data.placeId) {
      const place = await prisma.place.findUnique({ where: { id: data.placeId } });
      if (!place) throw new NotFoundError("Place not found");
    }

    return prisma.visit.create({
      data: {
        visitorId,
        hostId: data.hostId,
        placeId: data.placeId,
        purpose: data.purpose,
        status: VisitStatus.PENDING,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        notes: data.notes,
      },
      include: VISIT_INCLUDE,
    });
  }

  async updateVisitStatus(visitId: string, userId: string, status: VisitStatus) {
    const existing = await prisma.visit.findUnique({ where: { id: visitId } });

    if (!existing || existing.visitorId !== userId) {
      throw new NotFoundError("Visit not found");
    }

    const allowedTransitions: Record<VisitStatus, VisitStatus[]> = {
      [VisitStatus.PENDING]: [VisitStatus.APPROVED, VisitStatus.CANCELLED],
      [VisitStatus.APPROVED]: [VisitStatus.ARRIVED, VisitStatus.CANCELLED],
      [VisitStatus.ARRIVED]: [VisitStatus.IN_PROGRESS],
      [VisitStatus.IN_PROGRESS]: [VisitStatus.COMPLETED],
      [VisitStatus.COMPLETED]: [],
      [VisitStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[existing.status].includes(status)) {
      throw new BadRequestError(`Cannot change visit status from ${existing.status} to ${status}`);
    }

    return prisma.visit.update({
      where: { id: visitId },
      data: { status },
      include: VISIT_INCLUDE,
    });
  }

  async getVisitNotifications(visitorId: string) {
    return notificationService.getAll(visitorId);
  }

  async generateVisitQr(visitId: string, visitorId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { qrCode: true },
    });

    if (!visit || visit.visitorId !== visitorId) {
      throw new NotFoundError("Visit not found");
    }

    const validFrom = new Date(visit.scheduledDate);
    const validUntil = new Date(validFrom);
    validUntil.setHours(23, 59, 59, 999);

    const token = nanoid(32);

    const qr = await prisma.qrCode.create({
      data: {
        token,
        type: "VISIT_ACCESS",
        userId: visitorId,
        payload: {
          visitId: visit.id,
          visitorId: visit.visitorId,
          hostId: visit.hostId,
          purpose: visit.purpose,
          validFrom,
          validUntil,
        },
        expiresAt: validUntil,
      },
    });

    await prisma.visit.update({
      where: { id: visit.id },
      data: { qrCodeId: qr.id },
    });

    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: { dark: "#003d1f", light: "#ffffff" },
    });

    return {
      ...qr,
      qrCodeImage: qrDataUrl,
    };
  }

  // ─── Public Guest Methods (no auth required) ────────────────────────

  async createPublicVisit(data: {
    purpose: string;
    hostId: string;
    placeId?: string;
    scheduledDate: Date;
    scheduledTime?: string;
    notes?: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
  }) {
    const host = await prisma.user.findUnique({ where: { id: data.hostId } });
    if (!host) throw new NotFoundError("Host not found");

    if (data.placeId) {
      const place = await prisma.place.findUnique({ where: { id: data.placeId } });
      if (!place) throw new NotFoundError("Place not found");
    }

    const guestToken = nanoid(40);

    const scheduledDate = typeof data.scheduledDate === 'string'
      ? new Date(data.scheduledDate + 'T00:00:00.000Z')
      : new Date(data.scheduledDate);

    return prisma.visit.create({
      data: {
        guestToken,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        hostId: data.hostId,
        placeId: data.placeId,
        purpose: data.purpose,
        status: VisitStatus.PENDING,
        scheduledDate,
        scheduledTime: data.scheduledTime,
        notes: data.notes,
      },
      include: VISIT_INCLUDE,
    });
  }

  async getPublicVisit(guestToken: string) {
    const visit = await prisma.visit.findUnique({
      where: { guestToken },
      include: VISIT_INCLUDE,
    });
    if (!visit) throw new NotFoundError("Visit not found");
    return visit;
  }

  async getPublicVisitById(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: VISIT_INCLUDE,
    });
    if (!visit) throw new NotFoundError("Visit not found");
    return visit;
  }

  async generatePublicVisitQr(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { qrCode: true },
    });
    if (!visit) throw new NotFoundError("Visit not found");

    const validFrom = new Date(visit.scheduledDate);
    const validUntil = new Date(validFrom);
    validUntil.setHours(23, 59, 59, 999);

    const token = nanoid(32);

    const qr = await prisma.qrCode.create({
      data: {
        token,
        type: "VISIT_ACCESS",
        payload: {
          visitId: visit.id,
          guestName: visit.guestName,
          hostId: visit.hostId,
          purpose: visit.purpose,
          validFrom,
          validUntil,
        },
        expiresAt: validUntil,
      },
    });

    await prisma.visit.update({
      where: { id: visit.id },
      data: { qrCodeId: qr.id },
    });

    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: { dark: "#003d1f", light: "#ffffff" },
    });

    return {
      id: qr.id,
      token,
      qrCodeImage: qrDataUrl,
    };
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

export const guestService = new GuestService();
