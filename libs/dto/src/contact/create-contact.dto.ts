import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  bio: z.string().optional(),
  companyId: z.string().cuid2().optional(),
  jobApplicationId: z.string().cuid2().optional(),
});

export class CreateContactDto extends createZodDto(createContactSchema) {}
