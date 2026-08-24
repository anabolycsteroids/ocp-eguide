import { prisma } from "../config/database";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

export class QrService {
  async generate(data: {
    type: string;
    locationId?: string;
    userId?: string;
    payload?: any;
    expiresAt?: string | Date;
  }) {
    const token = nanoid(32);

    const qr = await prisma.qrCode.create({
      data: {
        token,
        type: data.type,
        locationId: data.locationId,
        userId: data.userId,
        payload: data.payload || undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
      include: {
        location: { select: { id: true, name: true, building: true } },
      },
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

  async getById(id: string) {
    const qr = await prisma.qrCode.findUnique({
      where: { id },
      include: {
        location: { select: { id: true, name: true, building: true, category: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!qr) throw new NotFoundError("QR code not found");
    return qr;
  }

  async getByToken(token: string) {
    const qr = await prisma.qrCode.findUnique({
      where: { token },
      include: {
        location: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!qr) throw new NotFoundError("QR code not found");

    if (qr.expiresAt && qr.expiresAt < new Date()) {
      throw new BadRequestError("QR code has expired");
    }

    if (!qr.active) {
      throw new BadRequestError("QR code is no longer active");
    }

    return qr;
  }

  async deactivate(id: string) {
    const qr = await prisma.qrCode.findUnique({ where: { id } });
    if (!qr) throw new NotFoundError("QR code not found");

    return prisma.qrCode.update({
      where: { id },
      data: { active: false },
    });
  }
}

export const qrService = new QrService();
