import { prisma } from "../config/database";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

export class UserService {
  async getAll(page = 1, limit = 20, search?: string, role?: string, department?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;
    if (department) where.department = department;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, role: true,
          department: true, position: true, phone: true, avatar: true,
          status: true, accountStatus: true, lastActiveAt: true, createdAt: true,
          supervisor: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true,
        department: true, position: true, phone: true, avatar: true,
        status: true, accountStatus: true, lastActiveAt: true, createdAt: true,
        supervisor: { select: { id: true, firstName: true, lastName: true, email: true, department: true } },
        interns: { select: { id: true, firstName: true, lastName: true, email: true, department: true, status: true } },
        internProfile: true,
        supervisorProfile: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");
    return user;
  }

  async updateStatus(userId: string, status: "ONLINE" | "BUSY" | "OFFLINE") {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status, lastActiveAt: new Date() },
      select: { id: true, firstName: true, lastName: true, status: true, lastActiveAt: true },
    });
    return user;
  }

  async getEmployees(page = 1, limit = 20, search?: string, department?: string) {
    const skip = (page - 1) * limit;
    const where: any = {
      role: { in: ["ADMIN", "EMPLOYEE"] },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (department) where.department = department;

    const [employees, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, role: true,
          department: true, position: true, phone: true, avatar: true,
          status: true, lastActiveAt: true,
        },
        skip,
        take: limit,
        orderBy: { firstName: "asc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      employees,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getEmployeeStatus(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, status: true, lastActiveAt: true, department: true, position: true },
    });
    if (!user) throw new NotFoundError("Employee not found");
    return user;
  }

  async getInternsBySupervisor(supervisorId: string) {
    const interns = await prisma.user.findMany({
      where: { supervisorId },
      select: {
        id: true, firstName: true, lastName: true, email: true, department: true,
        status: true, lastActiveAt: true, phone: true,
        internProfile: true,
        internshipsAsIntern: { select: { id: true, title: true, status: true, startDate: true, endDate: true } },
      },
    });
    return interns;
  }
}

export const userService = new UserService();
