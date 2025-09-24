import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";
import { createJobApplicationSchema } from "../job-application/create";
import { createCompanySchema } from "../company/create-company.dto";
import { createContactSchema } from "../contact/create-contact.dto";

// Job application schema without companyName and companyId (will be set automatically)
const automatedJobApplicationSchema = createJobApplicationSchema.omit({
  companyName: true,
  companyId: true,
});

// Contact schema without companyId and jobApplicationId (will be set automatically)  
const automatedContactSchema = createContactSchema.omit({
  companyId: true,
  jobApplicationId: true,
});

export const createAutomatedJobSchema = z.object({
  userId: z.string().cuid2(), // User who initiated the automation
  
  // Job application data
  jobApplication: automatedJobApplicationSchema,
  
  // Company data  
  company: createCompanySchema,
  
  // Array of contacts to create
  contacts: z.array(automatedContactSchema).default([]),
});

export class CreateAutomatedJobDto extends createZodDto(createAutomatedJobSchema) {}



















