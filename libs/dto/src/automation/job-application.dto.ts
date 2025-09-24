import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

// 🎯 Job Application Creation Schema for Automation
export const createAutomationJobApplicationSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  // 🔧 Handle Skyvern HTTP templating: Accept both arrays and stringified arrays
  requirements: z.union([
    z.array(z.string()),
    z.string().transform((str) => {
      try {
        // Parse string representation like "['item1', 'item2']" back to array
        if (typeof str === 'string' && str.startsWith('[') && str.endsWith(']')) {
          return JSON.parse(str);
        }
        // If it's just a single string, wrap in array
        return [str];
      } catch {
        // If JSON parsing fails, wrap the string in an array
        return [str];
      }
    })
  ]).default([]),
  extractedTags: z.union([
    z.array(z.string()),
    z.string().transform((str) => {
      try {
        // Parse string representation like "['item1', 'item2']" back to array
        if (typeof str === 'string' && str.startsWith('[') && str.endsWith(']')) {
          return JSON.parse(str);
        }
        // If it's just a single string, wrap in array
        return [str];
      } catch {
        // If JSON parsing fails, wrap the string in an array
        return [str];
      }
    })
  ]).default([]),
  url: z.string().url().optional(),
  status: z.enum([
    "DRAFT",
    "APPLIED", 
    "INTERVIEW_SCHEDULED",
    "INTERVIEWED",
    "OFFER_RECEIVED",
    "REJECTED",
    "ACCEPTED",
    "WITHDRAWN"
  ]).default("DRAFT"),
  location: z.string().optional(),
  salary: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  // 🎯 AUTOMATION FLAG
  createdViaAutomation: z.boolean().default(true), // Default true for automation endpoints
  userId: z.string().cuid2("Valid user ID required"),
});

export class CreateAutomationJobApplicationDto extends createZodDto(createAutomationJobApplicationSchema) {}

// 🏢 Company & Contacts Creation Schema for Automation
export const createAutomationCompanyContactsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyDescription: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  // 🆕 Enhanced LinkedIn company data
  linkedinUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  // 🔧 Handle Skyvern HTTP templating: Accept both arrays and stringified contacts
  contacts: z.union([
    z.array(z.object({
      name: z.string().min(1, "Contact name is required"),
      title: z.string().optional(),
      email: z.string().email().optional(),
      linkedinUrl: z.string().url().optional(),
      phone: z.string().optional(),
    })),
    z.string().transform((str) => {
      try {
        // Parse Python-style dict string like "{'type': 'array', 'items': [...]}"
        if (typeof str === 'string' && str.includes('\'type\'') && str.includes('\'items\'')) {
          // Extract the items array from the Python dict structure
          const match = str.match(/\'items\':\s*\[([\s\S]*)\]/);
          if (match) {
            // Convert Python dict format to JSON format for parsing
            const pythonArray = '[' + match[1] + ']';
            const jsonStr = pythonArray
              .replace(/'/g, '"')         // Replace single quotes with double quotes
              .replace(/None/g, 'null')   // Replace Python None with JSON null
              .replace(/True/g, 'true')   // Replace Python True with JSON true
              .replace(/False/g, 'false'); // Replace Python False with JSON false
            return JSON.parse(jsonStr);
          }
        }
        // Fallback: try direct JSON parsing
        if (str.startsWith('[') && str.endsWith(']')) {
          return JSON.parse(str);
        }
        // If all else fails, return empty array
        return [];
      } catch {
        // If parsing fails, return empty array
        return [];
      }
    })
  ]).default([]),
  userId: z.string().cuid2("Valid user ID required"),
});

export class CreateAutomationCompanyContactsDto extends createZodDto(createAutomationCompanyContactsSchema) {}

