import { Request, Response, NextFunction } from "express";
import { requestService } from "../services/request.service";
import { AuthRequest, ApiResponse } from "../types";

export class RequestController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, type } = req.query as any;
      const userId = req.user?.role === "ADMIN" || req.user?.role === "EMPLOYEE"
        ? undefined
        : req.user?.userId;
      const result = await requestService.getAll(
        parseInt(page) || 1,
        parseInt(limit) || 20,
        search,
        status,
        type,
        userId
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await requestService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: request };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const request = await requestService.create({
        ...req.body,
        creatorId: req.user!.userId,
      });
      const response: ApiResponse = {
        success: true,
        data: request,
        message: "Request created",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const request = await requestService.update(
        req.params.id as string,
        req.body,
        req.user?.userId
      );
      const response: ApiResponse = {
        success: true,
        data: request,
        message: "Request updated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();
