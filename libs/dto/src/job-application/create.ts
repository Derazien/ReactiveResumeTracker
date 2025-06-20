import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createJobApplicationSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
});

export class CreateJobApplicationDto extends createZodDto(createJobApplicationSchema) {}
