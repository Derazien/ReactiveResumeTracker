import { idSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { userSchema } from "../user";

export const contentLibrarySchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string().nullable(),
  content: z.record(z.any()),
  type: z.enum([
    "WORK_EXPERIENCE",
    "PROJECT",
    "TECHNICAL_SKILL",
    "SOFT_SKILL",
    "EDUCATION",
    "CERTIFICATION",
    "VOLUNTEER_EXPERIENCE",
    "PUBLICATION",
    "AWARD",
    "LANGUAGE",
    "INTEREST",
    "SUMMARY",
    "CONTACT_INFO",
    "REFERENCE",
  ]),
  userId: idSchema,
  user: userSchema.optional(),
  company: z.string().nullable(),
  position: z.string().nullable(),
  startDate: dateSchema.nullable(),
  endDate: dateSchema.nullable(),
  location: z.string().nullable(),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
  proficiencyLevel: z.number().min(0).max(100).nullable(),
  category: z.string().nullable(),
  issuer: z.string().nullable(),
  url: z.string().nullable(),
  contactPerson: z.string().nullable(),
  contactInfo: z.string().nullable(),
  isPresent: z.boolean().nullable(),
  courses: z.array(z.string()).default([]),
  score: z.string().nullable(),
  keywords: z.array(z.string()).default([]),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export class ContentLibraryDto extends createZodDto(contentLibrarySchema) {}
