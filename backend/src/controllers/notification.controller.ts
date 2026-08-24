import { Request, Response, NextFunction } from "express";
import { notificationService } from "../services/notification.service";
import { AuthRequest, ApiResponse } from "../types";

export class NotificationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, read, type } = req.query as any;
      const result = await notificationService.getAll(
        req.user!.userId,
        parseInt(page) || 1,
        parseInt(limit) || 20,
        read !== undefined ? read === "true" || read === true : undefined,
        type
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string, req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: notification,
        message: "Notification marked as read",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.userId);
      const response: ApiResponse = { success: true, message: result.message };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
