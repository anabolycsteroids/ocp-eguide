import { Request, Response, NextFunction } from "express";
import { guestService } from "../services/guest.service";
import { AuthRequest, ApiResponse } from "../types";

export class GuestController {
  async getMyVisits(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visits = await guestService.getMyVisits(req.user!.userId);
      const response: ApiResponse = { success: true, data: visits };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async searchHosts(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const hosts = await guestService.searchHosts(q);
      const response: ApiResponse = { success: true, data: hosts };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyActiveVisit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.getMyActiveVisit(req.user!.userId);
      const response: ApiResponse = { success: true, data: visit };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getVisitById(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.getVisitById(req.params.id as string, (req as AuthRequest).user!.userId);
      const response: ApiResponse = { success: true, data: visit };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async createVisit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.createVisit(req.user!.userId, req.body);
      const response: ApiResponse = { success: true, data: visit, message: "Visit created" };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateVisitStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const visit = await guestService.updateVisitStatus(req.params.id as string, req.user!.userId, status);
      const response: ApiResponse = { success: true, data: visit, message: "Visit status updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.checkIn(req.params.id as string, req.user!.userId);
      const response: ApiResponse = { success: true, data: visit, message: "Checked in successfully" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.checkOut(req.params.id as string, req.user!.userId);
      const response: ApiResponse = { success: true, data: visit, message: "Checked out successfully" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getHostPresence(req: Request, res: Response, next: NextFunction) {
    try {
      const presence = await guestService.getHostPresence(req.params.hostId as string);
      const response: ApiResponse = { success: true, data: presence };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await guestService.getVisitNotifications(req.user!.userId);
      const response: ApiResponse = { success: true, data: result };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async generateQr(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const qr = await guestService.generateVisitQr(req.params.id as string, req.user!.userId);
      const response: ApiResponse = { success: true, data: qr, message: "QR code generated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const guestController = new GuestController();
