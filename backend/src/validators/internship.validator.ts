import { z } from "zod";

export const createInternshipSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  internId: z.string().uuid("Invalid intern ID"),
  supervisorId: z.string().uuid("Invalid supervisor ID"),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()).optional(),
  department: z.enum(["MANAGEMENT", "HUMAN_RESOURCES", "IT", "SECURITY", "FINANCE", "ENGINEERING", "RECEPTION", "MAINTENANCE", "LOGISTICS", "LEGAL", "COMMUNICATION", "RESEARCH", "OTHER"]),
  objectives: z.string().max(2000).optional(),
});

export const updateInternshipSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "TERMINATED"]).optional(),
  supervisorId: z.string().uuid().optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  objectives: z.string().max(2000).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  internshipId: z.string().uuid("Invalid internship ID"),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
});

export const updateProgressSchema = z.object({
  completedTasks: z.number().int().min(0).optional(),
  totalTasks: z.number().int().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
  currentModule: z.string().max(200).optional(),
  totalModules: z.number().int().min(0).optional(),
  completedModules: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});
