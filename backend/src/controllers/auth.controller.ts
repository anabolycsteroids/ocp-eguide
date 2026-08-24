import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest, ApiResponse } from "../types";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: "Registration successful",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, profileSlug } = req.body;
      const result = await authService.login(email, password, profileSlug);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: "Login successful",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      const response: ApiResponse = {
        success: true,
        data: result,
        message: "Token refreshed",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user.userId);
      }
      const response: ApiResponse = {
        success: true,
        message: "Logout successful",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      const response: ApiResponse = {
        success: true,
        data: user,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
