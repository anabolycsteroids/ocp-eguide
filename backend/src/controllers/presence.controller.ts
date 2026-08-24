import { Request, Response, NextFunction } from "express";
import { presenceService } from "../services/presence.service";
import { AuthRequest, ApiResponse } from "../types";

export class PresenceController {
  async getMine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const presence = await presenceService.get(req.user!.userId);
      const response: ApiResponse = { success: true, data: presence };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const presence = await presenceService.get(req.params.userId as string);
      const response: ApiResponse = { success: true, data: presence };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const presences = await presenceService.getAll();
      const response: ApiResponse = { success: true, data: presences };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds)) {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "userIds array required" } });
        return;
      }
      const presences = await presenceService.getMultiple(userIds);
      const response: ApiResponse = { success: true, data: presences };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async setStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, statusNote } = req.body;
      if (!["ACTIVE", "BUSY"].includes(status)) {
        res.status(400).json({ success: false, error: { code: "BAD_REQUEST", message: "Status must be ACTIVE or BUSY" } });
        return;
      }
      const presence = await presenceService.setStatus(req.user!.userId, status, statusNote);
      const response: ApiResponse = { success: true, data: presence, message: "Status updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async heartbeat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const presence = await presenceService.heartbeat(req.user!.userId);
      const response: ApiResponse = { success: true, data: presence };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async sweepStale(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await presenceService.sweepStaleHeartbeats();
      const response: ApiResponse = { success: true, data: { markedOffline: count } };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const presenceController = new PresenceController();
