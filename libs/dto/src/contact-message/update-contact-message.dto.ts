import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const updateContactMessageSchema = z.object({
  type: z.string().optional(),
  subject: z.string().optional(),
  content: z.string().min(1).optional(),
  instructions: z.string().optional(),
  status: z.string().optional(),
  contactId: z.string().cuid2().optional(),
  jobApplicationId: z.string().cuid2().optional(),
});

export class UpdateContactMessageDto extends createZodDto(updateContactMessageSchema) {}
