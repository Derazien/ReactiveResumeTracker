import { createZodDto } from "nestjs-zod/dto";

import { createContentLibrarySchema } from "./create";

export const updateContentLibrarySchema = createContentLibrarySchema.partial();

export class UpdateContentLibraryDto extends createZodDto(updateContentLibrarySchema) {}
