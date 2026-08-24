import { prisma } from "../config/database";
import { NotFoundError } from "../middleware/errorHandler";

export class NotificationService {
  async getAll(userId: string, page = 1, limit = 20, read?: boolean, type?: string) {
    const skip = (page - 1) * limit;
    const where: any = { recipientId: userId };

    if (read !== undefined) where.read = read;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          sender: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    return {
      notifications,
      unreadCount,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(data: {
    recipientId: string;
    senderId?: string;
    title: string;
    message: string;
    type?: string;
  }) {
    const notification = await prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        title: data.title,
        message: data.message,
        type: (data.type as any) || "GENERAL",
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new NotFoundError("Notification not found");
    if (notification.recipientId !== userId) throw new NotFoundError("Notification not found");

    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });
    return { message: "All notifications marked as read" };
  }
}

export const notificationService = new NotificationService();
