import { prisma } from "../config/database";
import { NotFoundError } from "../middleware/errorHandler";

export class LocationService {
  async getAll(page = 1, limit = 20, search?: string, category?: string, building?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.category = category;
    if (building) where.building = building;

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.location.count({ where }),
    ]);

    return {
      locations,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: { qrCodes: { where: { active: true } } },
    });
    if (!location) throw new NotFoundError("Location not found");
    return location;
  }

  async create(data: {
    name: string;
    description?: string;
    category?: string;
    latitude?: number;
    longitude?: number;
    building?: string;
    floor?: string;
    roomNumber?: string;
    metadata?: any;
  }) {
    return prisma.location.create({
      data: {
        name: data.name,
        description: data.description,
        category: (data.category as any) || "OTHER",
        latitude: data.latitude,
        longitude: data.longitude,
        building: data.building,
        floor: data.floor,
        roomNumber: data.roomNumber,
        metadata: data.metadata || undefined,
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Location not found");

    return prisma.location.update({
      where: { id },
      data: {
        ...data,
        category: data.category ? data.category as any : undefined,
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Location not found");
    await prisma.location.delete({ where: { id } });
  }
}

export const locationService = new LocationService();
