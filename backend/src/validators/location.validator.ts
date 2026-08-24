import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(["OFFICE", "DEPARTMENT", "FACILITY", "MOSQUE", "RECEPTION", "PARKING", "SAFETY", "OTHER"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  building: z.string().max(100).optional(),
  floor: z.string().max(20).optional(),
  roomNumber: z.string().max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(["OFFICE", "DEPARTMENT", "FACILITY", "MOSQUE", "RECEPTION", "PARKING", "SAFETY", "OTHER"]).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  building: z.string().max(100).optional(),
  floor: z.string().max(20).optional(),
  roomNumber: z.string().max(20).optional(),
  metadata: z.record(z.unknown()).optional(),
});
