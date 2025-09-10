import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createCoverLetterSchema = z.object({
  content: z.string().min(1, "Content is required"),
  templateName: z.string().optional(),
  tone: z.string().default("professional"),
  jobApplicationId: z.string().cuid2({ message: "Job application ID must be a valid CUID" }),
  generatedFrom: z.string().default("[]"), // JSON array of content IDs used in generation
});

export class CreateCoverLetterDto extends createZodDto(createCoverLetterSchema) {}

