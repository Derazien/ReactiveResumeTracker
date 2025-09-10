import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createJobApplicationQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().optional(),
  questionType: z.string().default("general"),
  priority: z.number().int().min(1).max(5).default(1),
  jobApplicationId: z.string().cuid2(),
});

export class CreateJobApplicationQuestionDto extends createZodDto(
  createJobApplicationQuestionSchema,
) {}
