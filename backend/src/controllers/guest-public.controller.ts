import { Request, Response, NextFunction } from "express";
import { guestService } from "../services/guest.service";
import { ApiResponse } from "../types";

export class GuestPublicController {
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

  async createVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.createPublicVisit(req.body);
      const response: ApiResponse = { success: true, data: visit, message: "Visit requested successfully" };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token as string;
      const visit = await guestService.getPublicVisit(token);
      const response: ApiResponse = { success: true, data: visit };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getVisitById(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await guestService.getPublicVisitById(req.params.id as string);
      const response: ApiResponse = { success: true, data: visit };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async generateQr(req: Request, res: Response, next: NextFunction) {
    try {
      const qr = await guestService.generatePublicVisitQr(req.params.id as string);
      const response: ApiResponse = { success: true, data: qr, message: "QR code generated" };
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

  async getPlaces(_req: Request, res: Response, next: NextFunction) {
    try {
      const { prisma } = await import("../config/database");
      const places = await prisma.place.findMany({
        orderBy: { name: "asc" },
      });
      const response: ApiResponse = { success: true, data: places };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const guestPublicController = new GuestPublicController();
