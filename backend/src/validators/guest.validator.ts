import { z } from "zod";

export const getVisitSchema = z.object({}).passthrough();

export const checkInSchema = z.object({}).passthrough();

export const updateVisitStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], {
    errorMap: () => ({ message: "Invalid visit status" }),
  }),
});

export const createVisitSchema = z.object({
  hostId: z.string().min(1, "Host ID is required"),
  placeId: z.string().min(1).optional(),
  purpose: z.string().min(2, "Purpose must be at least 2 characters").max(500),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format").optional(),
  notes: z.string().max(1000).optional(),
});

export type GetVisitInput = z.infer<typeof getVisitSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;

export const createPublicVisitSchema = z.object({
  hostId: z.string().min(1, "Host is required"),
  placeId: z.string().min(1).optional(),
  purpose: z.string().min(2, "Purpose must be at least 2 characters").max(500),
  scheduledDate: z.string().min(1, "Date is required"),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format").optional(),
  notes: z.string().max(1000).optional(),
  guestName: z.string().min(1, "Your name is required").max(200),
  guestEmail: z.string().email("Valid email is required"),
  guestPhone: z.string().max(30).optional(),
});

export type CreatePublicVisitInput = z.infer<typeof createPublicVisitSchema>;
