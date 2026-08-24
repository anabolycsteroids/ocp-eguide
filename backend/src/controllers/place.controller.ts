import { Request, Response, NextFunction } from "express";
import { placeService } from "../services/place.service";
import { AuthRequest, ApiResponse } from "../types";

export class PlaceController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, type } = req.query as any;
      const places = await placeService.getAll(search, type);
      const response: ApiResponse = { success: true, data: places };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const place = await placeService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: place };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const place = await placeService.getByCode(req.params.code as string);
      const response: ApiResponse = { success: true, data: place };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateOccupancy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentOccupancy } = req.body;
      if (typeof currentOccupancy !== "number" || currentOccupancy < 0) {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "currentOccupancy must be a non-negative number" } });
        return;
      }
      const place = await placeService.updateOccupancy(req.params.id as string, currentOccupancy);
      const response: ApiResponse = { success: true, data: place, message: "Occupancy updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOccupancyHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query as any;
      const history = await placeService.getOccupancyHistory(req.params.id as string, parseInt(limit) || 20);
      const response: ApiResponse = { success: true, data: history };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const placeController = new PlaceController();
