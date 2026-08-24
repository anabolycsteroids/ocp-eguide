import { Request, Response, NextFunction } from "express";
import { qrService } from "../services/qr.service";
import { AuthRequest, ApiResponse } from "../types";

export class QrController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await qrService.generate({
        ...req.body,
        userId: req.user?.userId,
      });
      const response: ApiResponse = {
        success: true,
        data: result,
        message: "QR code generated",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const qr = await qrService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: qr };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const qr = await qrService.getByToken(req.params.token as string);
      const response: ApiResponse = { success: true, data: qr };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const qr = await qrService.deactivate(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: qr,
        message: "QR code deactivated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const qrController = new QrController();
