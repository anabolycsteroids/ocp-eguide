import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthRequest, JwtPayload } from "../types";
import { UnauthorizedError, ForbiddenError } from "./errorHandler";

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or invalid authorization header"));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(new UnauthorizedError("Invalid token"));
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Not authenticated"));
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      next(new ForbiddenError("Insufficient permissions"));
      return;
    }

    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
  } catch {
    // Token invalid but optional auth continues
  }

  next();
}
