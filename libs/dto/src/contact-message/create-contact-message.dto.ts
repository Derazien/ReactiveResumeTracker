import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createContactMessageSchema = z.object({
  type: z.string(), // email, linkedin, twitter, etc.
  subject: z.string().optional(),
  content: z.string().min(1),
  instructions: z.string().optional(),
  status: z.string().default("draft"),
  contactId: z.string().cuid2(),
  jobApplicationId: z.string().cuid2().optional(),
});

export class CreateContactMessageDto extends createZodDto(createContactMessageSchema) {}
