import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const updateJobApplicationQuestionSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().optional(),
  questionType: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  jobApplicationId: z.string().cuid2().optional(),
});

export class UpdateJobApplicationQuestionDto extends createZodDto(
  updateJobApplicationQuestionSchema,
) {}
