import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1),
  color: z
    .string()
    .regex(/^#[\da-f]{6}$/i)
    .optional(), // Hex color validation
});

export class CreateTagDto extends createZodDto(createTagSchema) {}
