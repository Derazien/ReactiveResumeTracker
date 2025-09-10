import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const coverLetterSchema = z.object({
  id: z.string().cuid2(),
  content: z.string(),
  templateName: z.string().optional(),
  tone: z.string().default("professional"),
  generatedFrom: z.string().default("[]"), // JSON array of content IDs
  jobApplicationId: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Relations
  jobApplication: z.object({
    id: z.string().cuid2(),
    title: z.string(),
    companyName: z.string().optional(),
    company: z.object({
      id: z.string().cuid2(),
      name: z.string(),
    }).optional(),
  }).optional(),
});

// Extended interface for frontend with computed fields
export interface CoverLetterWithMetadata extends z.infer<typeof coverLetterSchema> {
  // UI computed fields (extracted from content or derived)
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  companyName?: string;
  companyAddress?: string;
  recipientName?: string;
  recipientTitle?: string;
  usedContent?: any[];
}

export class CoverLetterDto extends createZodDto(coverLetterSchema) {}
