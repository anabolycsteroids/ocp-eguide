import { prisma } from "../config/database";
import { NotFoundError, BadRequestError, ForbiddenError } from "../middleware/errorHandler";

export class InternshipService {
  async getAll(page = 1, limit = 20, search?: string, status?: string, supervisorId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (supervisorId) where.supervisorId = supervisorId;

    const [internships, total] = await Promise.all([
      prisma.internship.findMany({
        where,
        include: {
          intern: { select: { id: true, firstName: true, lastName: true, email: true } },
          supervisor: { select: { id: true, firstName: true, lastName: true, email: true } },
          progress: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.internship.count({ where }),
    ]);

    return {
      internships,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        intern: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true, email: true, department: true, position: true } },
        progress: true,
        tasks: { orderBy: { createdAt: "desc" } },
        documents: true,
      },
    });
    if (!internship) throw new NotFoundError("Internship not found");
    return internship;
  }

  async create(data: {
    title: string;
    description?: string;
    internId: string;
    supervisorId: string;
    startDate: string | Date;
    endDate?: string | Date;
    department: string;
    objectives?: string;
  }) {
    const intern = await prisma.user.findUnique({ where: { id: data.internId } });
    if (!intern) throw new NotFoundError("Intern not found");

    const supervisor = await prisma.user.findUnique({ where: { id: data.supervisorId } });
    if (!supervisor) throw new NotFoundError("Supervisor not found");

    const internship = await prisma.internship.create({
      data: {
        title: data.title,
        description: data.description,
        internId: data.internId,
        supervisorId: data.supervisorId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        department: data.department as any,
        objectives: data.objectives,
      },
      include: {
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.internshipProgress.create({
      data: { internshipId: internship.id },
    });

    return internship;
  }

  async update(id: string, data: any) {
    const existing = await prisma.internship.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Internship not found");

    const internship = await prisma.internship.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? data.status as any : undefined,
        department: data.department ? data.department as any : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        supervisor: { select: { id: true, firstName: true, lastName: true, email: true } },
        progress: true,
      },
    });

    return internship;
  }

  async getProgress(internshipId: string) {
    const progress = await prisma.internshipProgress.findUnique({
      where: { internshipId },
    });
    if (!progress) throw new NotFoundError("Progress not found");
    return progress;
  }

  async updateProgress(internshipId: string, data: any) {
    const progress = await prisma.internshipProgress.findUnique({ where: { internshipId } });
    if (!progress) throw new NotFoundError("Progress not found");

    return prisma.internshipProgress.update({
      where: { internshipId },
      data: { ...data, lastUpdated: new Date() },
    });
  }
}

export const internshipService = new InternshipService();
