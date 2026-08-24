import { z } from "zod";

export const generateQrSchema = z.object({
  type: z.string().min(1, "Type is required").max(50),
  locationId: z.string().uuid().optional(),
  payload: z.record(z.unknown()).optional(),
  expiresAt: z.string().datetime().or(z.date()).optional(),
});

export const notificationFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  read: z.coerce.boolean().optional(),
  type: z.enum(["TASK_ASSIGNED", "TASK_UPDATED", "REQUEST_CREATED", "REQUEST_UPDATED", "REQUEST_APPROVED", "REQUEST_REJECTED", "SUPERVISOR_MESSAGE", "GENERAL", "ANNOUNCEMENT", "SYSTEM"]).optional(),
});
