import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(["ADMIN", "EMPLOYEE", "INTERN", "VISITOR", "COLLABORATOR", "PARTNER", "SUPPLIER", "SERVICE_PROVIDER"]).optional(),
  department: z.enum(["MANAGEMENT", "HUMAN_RESOURCES", "IT", "SECURITY", "FINANCE", "ENGINEERING", "RECEPTION", "MAINTENANCE", "LOGISTICS", "LEGAL", "COMMUNICATION", "RESEARCH", "OTHER"]).optional(),
  position: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  profileSlug: z.string().min(1).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
  department: z.enum(["MANAGEMENT", "HUMAN_RESOURCES", "IT", "SECURITY", "FINANCE", "ENGINEERING", "RECEPTION", "MAINTENANCE", "LOGISTICS", "LEGAL", "COMMUNICATION", "RESEARCH", "OTHER"]).optional(),
  position: z.string().max(100).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum(["ONLINE", "BUSY", "OFFLINE"]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
