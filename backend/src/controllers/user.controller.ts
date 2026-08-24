import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { AuthRequest, ApiResponse } from "../types";

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, role, department } = req.query as any;
      const result = await userService.getAll(
        parseInt(page) || 1,
        parseInt(limit) || 20,
        search,
        role,
        department
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: user };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const user = await userService.updateStatus(req.params.id as string, status);
      const response: ApiResponse = {
        success: true,
        data: user,
        message: "Status updated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, department } = req.query as any;
      const result = await userService.getEmployees(
        parseInt(page) || 1,
        parseInt(limit) || 20,
        search,
        department
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await userService.getEmployeeStatus(req.params.id as string);
      const response: ApiResponse = { success: true, data: status };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getInternsBySupervisor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const supervisorId = (req.params.supervisorId as string) || req.user!.userId;
      const interns = await userService.getInternsBySupervisor(supervisorId);
      const response: ApiResponse = { success: true, data: interns };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
