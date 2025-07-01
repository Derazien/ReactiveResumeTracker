import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const bulkDeleteResumeSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export class BulkDeleteResumeDto extends createZodDto(bulkDeleteResumeSchema) {}

export const deleteAllResumesSchema = z.object({
  confirmation: z.literal("DELETE_ALL_RESUMES", {
    errorMap: () => ({ message: "Must provide exact confirmation string: DELETE_ALL_RESUMES" }),
  }),
});

export class DeleteAllResumesDto extends createZodDto(deleteAllResumesSchema) {}

export type BulkDeleteResult = {
  deletedCount: number;
  deletedResumes: {
    id: string;
    title: string;
  }[];
};
