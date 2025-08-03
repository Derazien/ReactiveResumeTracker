import { forwardRef, Module } from "@nestjs/common";
import { PrismaModule } from "nestjs-prisma";

import { ContentLibraryModule } from "@/server/content-library/content-library.module";
import { EmbeddingModule } from "@/server/embedding/embedding.module";
import { TagExtractionService } from "@/server/llm/tag-extraction.service";

import { ContentMatchingService } from "./content-matching.service";

@Module({
  imports: [PrismaModule, forwardRef(() => ContentLibraryModule), EmbeddingModule],
  providers: [ContentMatchingService, TagExtractionService],
  exports: [ContentMatchingService],
})
export class ContentMatchingModule {}
