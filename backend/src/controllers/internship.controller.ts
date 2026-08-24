import { Request, Response, NextFunction } from "express";
import { internshipService } from "../services/internship.service";
import { AuthRequest, ApiResponse } from "../types";

export class InternshipController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, supervisorId } = req.query as any;
      const result = await internshipService.getAll(
        parseInt(page) || 1,
        parseInt(limit) || 20,
        search,
        status,
        supervisorId
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const internship = await internshipService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: internship };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const internship = await internshipService.create(req.body);
      const response: ApiResponse = {
        success: true,
        data: internship,
        message: "Internship created",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const internship = await internshipService.update(req.params.id as string, req.body);
      const response: ApiResponse = {
        success: true,
        data: internship,
        message: "Internship updated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await internshipService.getProgress(req.params.id as string);
      const response: ApiResponse = { success: true, data: progress };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const progress = await internshipService.updateProgress(req.params.id as string, req.body);
      const response: ApiResponse = {
        success: true,
        data: progress,
        message: "Progress updated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const internshipController = new InternshipController();
