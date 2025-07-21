import { z } from "zod";

import { defaultItem, defaultUrl, itemSchema, urlSchema } from "../shared";

// Schema
export const experienceContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export type ExperienceContact = z.infer<typeof experienceContactSchema>;

export const experienceSchema = itemSchema.extend({
  company: z.string().min(1),
  position: z.string(),
  location: z.string(),
  date: z.string(),
  summary: z.string(),
  url: urlSchema,
  contacts: z.array(experienceContactSchema).default([]),
});

// Type
export type Experience = z.infer<typeof experienceSchema>;

// Defaults
export const defaultExperience: Experience = {
  ...defaultItem,
  company: "",
  position: "",
  location: "",
  date: "",
  summary: "",
  url: defaultUrl,
  contacts: [],
};
