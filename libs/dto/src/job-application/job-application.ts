import { idSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { userSchema } from "../user";

// Basic resume schema for relations
const resumeRelationSchema = z.object({
  id: idSchema,
  title: z.string(),
  slug: z.string(),
  visibility: z.enum(["private", "public"]),
  locked: z.boolean(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Basic cover letter schema for relations
const coverLetterRelationSchema = z.object({
  id: idSchema,
  content: z.string(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Basic interview schema for relations
const interviewRelationSchema = z.object({
  id: idSchema,
  type: z.string(),
  content: z.string().nullable(),
  audioUrl: z.string().nullable(),
  insights: z.string().nullable(),
  createdAt: dateSchema,
});

// GeneratedContent model removed - no longer needed

export const jobApplicationSchema = z.object({
  id: idSchema,
  title: z.string(),
  company: z.string(),
  description: z.string().nullable(),
  requirements: z.array(z.string()),
  extractedTags: z.array(z.string()),
  url: z.string().nullable(),
  status: z.enum([
    "DRAFT",
    "APPLIED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "OFFER_RECEIVED",
    "REJECTED",
    "ACCEPTED",
    "WITHDRAWN",
  ]),
  appliedDate: dateSchema.nullable(),
  notes: z.string().nullable(),
  userId: idSchema,
  user: userSchema.optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  // Optional relations that may be included
  resumes: z.array(resumeRelationSchema).optional(),
  coverLetters: z.array(coverLetterRelationSchema).optional(),
  interviews: z.array(interviewRelationSchema).optional(),
});

export class JobApplicationDto extends createZodDto(jobApplicationSchema) {}
