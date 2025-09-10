import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const updateCoverLetterSchema = z.object({
  content: z.string().min(1).optional(),
  templateName: z.string().optional(),
  tone: z.string().optional(),
});

export class UpdateCoverLetterDto extends createZodDto(updateCoverLetterSchema) {}

