import { idSchema } from "@reactive-resume/schema";
import { dateSchema } from "@reactive-resume/utils";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

import { userSchema } from "../user";

export const tagSchema = z.object({
  id: idSchema,
  name: z.string(),
  color: z.string().nullable(),
  userId: idSchema,
  user: userSchema.optional(),
  createdAt: dateSchema,
});

export class TagDto extends createZodDto(tagSchema) {}
