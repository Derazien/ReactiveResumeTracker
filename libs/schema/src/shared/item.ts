import { z } from "zod";

import { idSchema } from "./id";

// Schema
export const itemSchema = z.object({
  id: idSchema,
  visible: z.boolean(),
  contentLibraryId: idSchema.nullable().optional(),
  sourceContentLibraryId: idSchema.nullable().optional(),
});

// Type
export type Item = z.infer<typeof itemSchema>;

// Defaults
export const defaultItem: Item = {
  id: "",
  visible: true,
  contentLibraryId: null,
  sourceContentLibraryId: null,
};
