import { Request, Response, NextFunction } from "express";
import { locationService } from "../services/location.service";
import { ApiResponse } from "../types";

export class LocationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, category, building } = req.query as any;
      const result = await locationService.getAll(
        parseInt(page) || 1,
        parseInt(limit) || 20,
        search,
        category,
        building
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: location };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.create(req.body);
      const response: ApiResponse = {
        success: true,
        data: location,
        message: "Location created",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const location = await locationService.update(req.params.id as string, req.body);
      const response: ApiResponse = {
        success: true,
        data: location,
        message: "Location updated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await locationService.delete(req.params.id as string);
      const response: ApiResponse = { success: true, message: "Location deleted" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const locationController = new LocationController();
