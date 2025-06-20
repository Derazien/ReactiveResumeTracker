import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createContentLibrarySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.record(z.any()).default({}), // Flexible JSON content
  type: z.enum([
    "WORK_EXPERIENCE",
    "PROJECT",
    "TECHNICAL_SKILL",
    "SOFT_SKILL",
    "EDUCATION",
    "CERTIFICATION",
    "VOLUNTEER_EXPERIENCE",
    "PUBLICATION",
    "AWARD",
    "LANGUAGE",
    "INTEREST",
  ]),
  company: z.string().optional(),
  position: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]), // Tags to associate
});

export class CreateContentLibraryDto extends createZodDto(createContentLibrarySchema) {}
