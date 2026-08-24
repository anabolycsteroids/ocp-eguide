import { prisma } from "../config/database";
import { NotFoundError } from "../middleware/errorHandler";

export class PlaceService {
  async getAll(search?: string, type?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;

    const places = await prisma.place.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return places.map((p) => this.enrichPlace(p));
  }

  async getById(id: string) {
    const place = await prisma.place.findUnique({ where: { id } });
    if (!place) throw new NotFoundError("Place not found");
    return this.enrichPlace(place);
  }

  async getByCode(code: string) {
    const place = await prisma.place.findUnique({ where: { code } });
    if (!place) throw new NotFoundError("Place not found");
    return this.enrichPlace(place);
  }

  async updateOccupancy(id: string, currentOccupancy: number) {
    const place = await prisma.place.findUnique({ where: { id } });
    if (!place) throw new NotFoundError("Place not found");

    let status: "AVAILABLE" | "BUSY" | "FULL" | "CLOSED" = "AVAILABLE";
    if (place.capacity > 0) {
      const ratio = currentOccupancy / place.capacity;
      if (ratio >= 1) status = "FULL";
      else if (ratio >= 0.8) status = "BUSY";
      else status = "AVAILABLE";
    }

    const updated = await prisma.place.update({
      where: { id },
      data: { currentOccupancy, status },
    });

    await prisma.placeOccupancy.create({
      data: {
        placeId: id,
        currentOccupancy,
        capacity: updated.capacity,
        status,
      },
    });

    return this.enrichPlace(updated);
  }

  async getOccupancyHistory(id: string, limit = 20) {
    const records = await prisma.placeOccupancy.findMany({
      where: { placeId: id },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
    return records;
  }

  private enrichPlace(place: any) {
    const occupancyPercentage = place.capacity > 0
      ? Math.round((place.currentOccupancy / place.capacity) * 100)
      : 0;

    let statusLabel = "Available";
    if (place.status === "BUSY") statusLabel = "Busy";
    else if (place.status === "FULL") statusLabel = "Full";
    else if (place.status === "CLOSED") statusLabel = "Closed";

    return {
      ...place,
      occupancyPercentage,
      statusLabel,
    };
  }
}

export const placeService = new PlaceService();
