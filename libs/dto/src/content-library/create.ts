import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createContentLibrarySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.record(z.any()).default({}), // Flexible JSON content
  sectionId: z.string().cuid2(), // Reference to Section table
  company: z.string().optional(),
  position: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  // New fields for NovoResume compatibility
  proficiencyLevel: z.number().min(0).max(100).optional(),
  category: z.string().optional(),
  issuer: z.string().optional(),
  url: z.string().optional(),
  contactPerson: z.string().optional(),
  contactInfo: z.string().optional(),
  isPresent: z.boolean().optional(),
  courses: z.array(z.string()).default([]),
  score: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]), // Tags to associate
});

export class CreateContentLibraryDto extends createZodDto(createContentLibrarySchema) {}
