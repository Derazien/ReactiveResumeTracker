import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createJobApplicationSchema = z.object({
  title: z.string().min(1),
  companyName: z.string().min(1),
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
    .default("DRAFT"),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  extractedTags: z.array(z.string()).default([]),
  // 🎯 AUTOMATION FIELD
  createdViaAutomation: z.boolean().default(false).optional(),
  // Additional optional fields for automation
  location: z.string().optional(),
  salary: z.string().optional(),
  industry: z.string().optional(),
});

export class CreateJobApplicationDto extends createZodDto(createJobApplicationSchema) {}
