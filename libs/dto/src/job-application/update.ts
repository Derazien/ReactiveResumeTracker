import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const updateJobApplicationSchema = z.object({
  title: z.string().min(1).optional(),
  companyName: z.string().min(1).optional(),
  companyId: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  status: z
    .enum([
      "DRAFT",
      "APPLIED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEWED",
      "OFFER_RECEIVED",
      "REJECTED",
      "ACCEPTED",
      "WITHDRAWN",
    ])
    .optional(),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  extractedTags: z.array(z.string()).optional(),
});

export class UpdateJobApplicationDto extends createZodDto(updateJobApplicationSchema) {}
