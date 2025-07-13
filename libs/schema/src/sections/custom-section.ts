import { z } from "zod";

import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

// Schema
export const customSectionSchema = itemSchema.extend({
  name: z.string(),
  description: z.string(),
  showDescription: z.boolean().default(true),
  date: z.string(),
  location: z.string(),
  summary: z.string(),
  keywords: z.array(z.string()).default([]),
  showKeywords: z.boolean().default(true),
  url: urlSchema,
});

// Type
export type CustomSection = z.infer<typeof customSectionSchema>;

// Defaults
export const defaultCustomSection: CustomSection = {
  ...defaultItem,
  name: "",
  description: "",
  showDescription: true,
  date: "",
  location: "",
  summary: "",
  keywords: [],
  showKeywords: true,
  url: defaultUrl,
};
