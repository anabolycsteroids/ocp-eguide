import { prisma } from "../config/database";
import { NotFoundError } from "../middleware/errorHandler";

export class TaskService {
  async getAll(page = 1, limit = 20, search?: string, status?: string, assigneeId?: string, internshipId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (internshipId) where.internshipId = internshipId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
          creator: { select: { id: true, firstName: true, lastName: true } },
          internship: { select: { id: true, title: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        internship: { select: { id: true, title: true } },
      },
    });
    if (!task) throw new NotFoundError("Task not found");
    return task;
  }

  async create(data: {
    title: string;
    description?: string;
    internshipId: string;
    assigneeId?: string;
    creatorId?: string;
    priority?: string;
    dueDate?: string | Date;
  }) {
    const internship = await prisma.internship.findUnique({ where: { id: data.internshipId } });
    if (!internship) throw new NotFoundError("Internship not found");

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        internshipId: data.internshipId,
        assigneeId: data.assigneeId,
        creatorId: data.creatorId,
        priority: (data.priority as any) || "MEDIUM",
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.recalculateProgress(data.internshipId);
    return task;
  }

  async update(id: string, data: any, userId?: string) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Task not found");

    const updateData: any = { ...data };
    if (data.status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        status: data.status ? data.status as any : undefined,
        priority: data.priority ? data.priority as any : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
        internship: { select: { id: true, title: true } },
      },
    });

    await this.recalculateProgress(existing.internshipId);
    return task;
  }

  async delete(id: string) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Task not found");

    await prisma.task.delete({ where: { id } });
    await this.recalculateProgress(existing.internshipId);
  }

  private async recalculateProgress(internshipId: string) {
    const tasks = await prisma.task.findMany({ where: { internshipId } });
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    await prisma.internshipProgress.update({
      where: { internshipId },
      data: { completedTasks: completed, totalTasks: total, percentage, lastUpdated: new Date() },
    });
  }
}

export const taskService = new TaskService();
