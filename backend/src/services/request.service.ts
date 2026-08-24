import { prisma } from "../config/database";
import { NotFoundError, ForbiddenError } from "../middleware/errorHandler";

export class RequestService {
  async getAll(page = 1, limit = 20, search?: string, status?: string, type?: string, userId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (type) where.type = type;
    if (userId) where.creatorId = userId;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
          handler: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.request.count({ where }),
    ]);

    return {
      requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        handler: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!request) throw new NotFoundError("Request not found");
    return request;
  }

  async create(data: {
    type: string;
    title: string;
    description?: string;
    creatorId: string;
  }) {
    const request = await prisma.request.create({
      data: {
        type: data.type as any,
        title: data.title,
        description: data.description,
        creatorId: data.creatorId,
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });
    return request;
  }

  async update(id: string, data: { status?: string; response?: string }, handlerId?: string) {
    const existing = await prisma.request.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Request not found");

    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === "APPROVED" || data.status === "REJECTED") {
        updateData.resolvedAt = new Date();
        updateData.handlerId = handlerId;
      }
    }
    if (data.response) updateData.response = data.response;

    const request = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        handler: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return request;
  }
}

export const requestService = new RequestService();
