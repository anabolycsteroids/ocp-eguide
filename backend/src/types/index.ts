import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  profileSlug?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SocketUser {
  userId: string;
  socketId: string;
  role: string;
}
