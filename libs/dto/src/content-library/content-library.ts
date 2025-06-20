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
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

export class ContentLibraryDto extends createZodDto(contentLibrarySchema) {}
