import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  location: z.string().optional(),
  values: z.string().default("[]"), // JSON array as string
  mission: z.string().optional(),
  culture: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  facebookUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  youtubeUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
});

export class CreateCompanyDto extends createZodDto(createCompanySchema) {}
