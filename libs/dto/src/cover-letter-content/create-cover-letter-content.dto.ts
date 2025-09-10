import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const createCoverLetterContentSchema = z.object({
  contentType: z.enum([
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
  ]),
  contentId: z.string().cuid2(),
  storyText: z.string().min(1),
  skillTheme: z.string().min(1),
  tone: z.string().default("professional"),
  tags: z.string().default("[]"), // JSON array as string
});

export class CreateCoverLetterContentDto extends createZodDto(createCoverLetterContentSchema) {}
