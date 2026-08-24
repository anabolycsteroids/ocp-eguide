import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { AuthRequest, ApiResponse } from "../types";

export class TaskController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, assigneeId, internshipId } = req.query as any;
      const result = await taskService.getAll(
        parseInt(page) || 1,
        parseInt(limit) || 20,
        search,
        status,
        assigneeId,
        internshipId
      );
      const response: ApiResponse = { success: true, ...result, meta: result.meta };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getById(req.params.id as string);
      const response: ApiResponse = { success: true, data: task };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create({
        ...req.body,
        creatorId: req.user?.userId,
      });
      const response: ApiResponse = {
        success: true,
        data: task,
        message: "Task created",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id as string, req.body, req.user?.userId);
      const response: ApiResponse = {
        success: true,
        data: task,
        message: "Task updated",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id as string);
      const response: ApiResponse = { success: true, message: "Task deleted" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
