import { z } from "zod";

export const createRequestSchema = z.object({
  type: z.enum(["DOCUMENT_REQUEST", "ACCESS_REQUEST", "MEETING_REQUEST", "SUPERVISOR_REQUEST", "GENERAL_REQUEST"]),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
});

export const updateRequestSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  response: z.string().max(2000).optional(),
});

export const requestFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  type: z.enum(["DOCUMENT_REQUEST", "ACCESS_REQUEST", "MEETING_REQUEST", "SUPERVISOR_REQUEST", "GENERAL_REQUEST"]).optional(),
  search: z.string().optional(),
});
