import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const updateCoverLetterContentSchema = z.object({
  contentType: z
    .enum([
      "PARAGRAPH_ANALYTICS",
      "PARAGRAPH_DIVERSITY",
      "PARAGRAPH_LEADERSHIP",
      "PARAGRAPH_TECH",
      "PARAGRAPH_CHALLENGE",
      "PARAGRAPH_COLLABORATION",
      "PARAGRAPH_INNOVATION",
      "PARAGRAPH_IMPACT",
      "PARAGRAPH_GROWTH",
      "PARAGRAPH_VALUES",
    ])
    .optional(),
  contentId: z.string().cuid2().optional(),
  storyText: z.string().min(1).optional(),
  skillTheme: z.string().min(1).optional(),
  tone: z.string().optional(),
  tags: z.string().optional(), // JSON array as string
});

export class UpdateCoverLetterContentDto extends createZodDto(updateCoverLetterContentSchema) {}
