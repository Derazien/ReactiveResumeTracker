import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createContentLibrarySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  data: z.string().default("{}"), // JSON string containing section-specific data
  sectionId: z.string().cuid2(), // Reference to Section table
  tagIds: z.array(z.string()).default([]), // Tags to associate
});

export class CreateContentLibraryDto extends createZodDto(createContentLibrarySchema) {}
