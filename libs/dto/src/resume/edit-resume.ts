import { resumeDataSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const editResumeSchema = z.object({
  prompt: z.string().min(1).max(1000), // User's natural language instruction
  resumeData: resumeDataSchema, // Current resume data to be edited
  includeJobContext: z.boolean().optional(), // Include job context for better tailoring
  selectedSections: z.array(z.string()).optional(), // Specific sections to edit (if not provided, edit all)
});

export class EditResumeDto extends createZodDto(editResumeSchema) {}

export type EditResume = z.infer<typeof editResumeSchema>;
